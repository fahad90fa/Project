import socket
import sys
import json
import argparse
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    from scapy.all import IP, TCP, sr1
    SCAPY_AVAILABLE = True
except Exception:
    SCAPY_AVAILABLE = False


def emit_progress(event_type, data):
    """Write a progress event to stderr as a single JSON line."""
    payload = {"event": event_type, "data": data, "ts": time.time()}
    print(json.dumps(payload), file=sys.stderr, flush=True)


# Used ONLY as a fallback liveness probe for hosts that turn out to have
# zero open ports in the requested scan range (see run_scan below). Trying
# several common ports instead of just one (e.g. port 80) avoids wrongly
# marking a real, reachable host as "down" just because it isn't running a
# web server.
COMMON_LIVENESS_PORTS = [80, 443, 22, 3389, 445, 21, 8080, 3306, 23, 25, 8443]


class HostDiscovery:
    def __init__(self, targets):
        self.targets = targets
        self.resolved_ip = []

    def resolve_targets(self):
        for t in self.targets:
            try:
                ip = socket.gethostbyname(t)
                self.resolved_ip.append(ip)
                emit_progress("host_resolved", {"target": t, "ip": ip})
            except socket.gaierror:
                emit_progress("host_unresolved", {"target": t})
        return self.resolved_ip

    @staticmethod
    def quick_liveness_check(ip, ports=COMMON_LIVENESS_PORTS, timeout=0.5):
        for port in ports:
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.settimeout(timeout)
                result = s.connect_ex((ip, port))
                s.close()
                if result == 0:
                    return True
            except Exception:
                continue
        return False


class PortScanner:
    def __init__(self, live_hosts, start_port, end_port, max_workers=100):
        self.live_hosts = live_hosts
        self.open_ports = {}
        self.start_port = start_port
        self.end_port = end_port
        self.max_workers = max_workers

    def scan_port(self, ip, port):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(1)
            result = s.connect_ex((ip, port))
            s.close()
            if result == 0:
                return port
        except Exception:
            return None
        return None

    def run_scan(self):
        total_ports = self.end_port - self.start_port + 1
        for ip in self.live_hosts:
            self.open_ports[ip] = []
            scanned = 0
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                futures = {
                    executor.submit(self.scan_port, ip, port): port
                    for port in range(self.start_port, self.end_port + 1)
                }
                for future in as_completed(futures):
                    scanned += 1
                    open_port = future.result()
                    if open_port is not None:
                        self.open_ports[ip].append(open_port)
                        emit_progress("port_open", {"ip": ip, "port": open_port})
                    if scanned % 50 == 0 or scanned == total_ports:
                        emit_progress("scan_progress", {
                            "ip": ip, "scanned": scanned, "total": total_ports
                        })
            self.open_ports[ip].sort()
        return self.open_ports


class ServiceDetection:
    def __init__(self, open_ports):
        self.open_ports = open_ports
        self.service_info = {}

    def probe(self, ip, port):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(2)
            s.connect((ip, port))
            s.send(b"\r\n")
            r = s.recv(1024)
            s.close()
            return r.decode(errors="ignore").strip() or "No banner"
        except Exception:
            return "Unknown"

    def run(self):
        for ip, ports in self.open_ports.items():
            self.service_info[ip] = {}
            for p in ports:
                banner = self.probe(ip, p)
                self.service_info[ip][p] = banner
                emit_progress("service_detected", {"ip": ip, "port": p, "banner": banner})
        return self.service_info


class OSDetection:
    def __init__(self, live_hosts, probe_port=443):
        self.live_hosts = live_hosts
        self.os_info = {}
        self.port = probe_port

    def detect(self):
        for ip in self.live_hosts:
            self.os_info[ip] = self._detect_one(ip)
            emit_progress("os_detected", {"ip": ip, "os": self.os_info[ip]})
        return self.os_info

    def _detect_one(self, ip):
        if SCAPY_AVAILABLE:
            try:
                packet = IP(dst=ip) / TCP(dport=self.port, flags="S")
                response = sr1(packet, timeout=1, verbose=0)
                if response is None:
                    return "Unknown"
                ttl = response[IP].ttl
                window = response[TCP].window
                if ttl <= 64 and window == 5840:
                    return "Linux"
                elif ttl <= 128 and window == 65535:
                    return "Windows"
                elif ttl <= 64 and window == 65535:
                    return "Mac"
                return "Unknown"
            except PermissionError:
                return self._fallback_ttl(ip)
            except Exception:
                return "Unknown"
        return self._fallback_ttl(ip)

    def _fallback_ttl(self, ip):
        # NOTE: getsockopt(IPPROTO_IP, IP_TTL) on a connected client socket
        # returns the TTL configured for OUR OWN outgoing packets (OS default,
        # usually 64 on Linux) — it does NOT reflect the TTL the remote host's
        # packets arrived with. Without a raw socket (root) or scapy, there is
        # no portable, non-privileged way to read the incoming TTL, so we
        # can't reliably fingerprint the OS this way. Reporting "Unknown" is
        # honest; guessing here would silently mislabel almost every host.
        return "Unknown"


DANGEROUS_PORTS = {21, 23, 135, 139, 445, 3389, 1433, 3306, 5900}


def calculate_risk(ip, open_ports, os_name, service_info):
    """Basic heuristic risk scoring — refined further by the Node-side
    risk engine (utils/riskEngine.js) which has organization-level context."""
    score = 0
    reasons = []
    for p in open_ports:
        if p in DANGEROUS_PORTS:
            score += 15
            reasons.append(f"Exposed high-risk service on port {p}")
        else:
            score += 3
    if os_name == "Unknown":
        score += 5
        reasons.append("OS fingerprint could not be determined")
    if len(open_ports) > 15:
        score += 10
        reasons.append("Large attack surface (many open ports)")
    score = min(score, 100)
    if score >= 70:
        level = "Critical"
    elif score >= 50:
        level = "High"
    elif score >= 25:
        level = "Medium"
    elif score > 0:
        level = "Low"
    else:
        level = "Informational"
    return {"score": score, "level": level, "reasons": reasons}


def run_scan(targets, start_port, end_port, run_os_scan=True):
    hd = HostDiscovery(targets)
    resolved_hosts = hd.resolve_targets()

    # Scan the full requested range for every resolved target directly —
    # liveness is no longer a single-port gate that can skip a real host.
    ps = PortScanner(resolved_hosts, start_port, end_port)
    open_ports = ps.run_scan()

    live_hosts = []
    for ip in resolved_hosts:
        if open_ports.get(ip):
            live_hosts.append(ip)
            emit_progress("host_status", {"ip": ip, "status": "up"})
        elif HostDiscovery.quick_liveness_check(ip):
            live_hosts.append(ip)
            emit_progress("host_status", {"ip": ip, "status": "up"})
        else:
            emit_progress("host_status", {"ip": ip, "status": "down"})

    sd = ServiceDetection({ip: open_ports.get(ip, []) for ip in live_hosts})
    service_info = sd.run()

    os_info = {}
    if run_os_scan:
        osd = OSDetection(live_hosts)
        os_info = osd.detect()

    results = []
    for ip in live_hosts:
        ports = open_ports.get(ip, [])
        os_name = os_info.get(ip, "Unknown")
        risk = calculate_risk(ip, ports, os_name, service_info.get(ip, {}))
        results.append({
            "ip": ip,
            "status": "up",
            "os": os_name,
            "openPorts": ports,
            "services": service_info.get(ip, {}),
            "risk": risk,
        })

    return {
        "success": True,
        "scannedAt": time.time(),
        "targets": targets,
        "portRange": {"start": start_port, "end": end_port},
        "hostsScanned": len(resolved_hosts),
        "hostsUp": len(live_hosts),
        "results": results,
    }


def main():
    parser = argparse.ArgumentParser(description="Network Reconnaissance Engine")
    parser.add_argument("--targets", required=True, help="Comma-separated IPs/domains")
    parser.add_argument("--start-port", type=int, default=1)
    parser.add_argument("--end-port", type=int, default=1024)
    parser.add_argument("--os-scan", action="store_true", default=True)
    parser.add_argument("--no-os-scan", dest="os_scan", action="store_false")
    args = parser.parse_args()

    targets = [t.strip() for t in args.targets.split(",") if t.strip()]
    if not targets:
        print(json.dumps({"success": False, "error": "No valid targets provided"}))
        sys.exit(1)

    try:
        result = run_scan(
            targets=targets,
            start_port=args.start_port,
            end_port=args.end_port,
            run_os_scan=args.os_scan,
        )
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
