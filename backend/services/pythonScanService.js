import { spawn } from "child_process";
import path from "path";

const PYTHON_BIN = process.env.PYTHON_BIN || "python3";
const SCRIPT_PATH = path.resolve(process.cwd(), process.env.PYTHON_SCRIPT_PATH || "../python-engine/nmap_scanner.py");

// Basic allow-list validation so only well-formed hostnames/IPs reach argv.
// This does NOT authorize scanning — that's an organizational/legal control —
// it only prevents malformed input or argument injection.
const TARGET_PATTERN = /^[a-zA-Z0-9.\-:]+$/;

function validateTargets(targets) {
  return targets.every((t) => TARGET_PATTERN.test(t) && t.length <= 255);
}

/**
 * Runs the Python scanning engine as a child process.
 * @param {Object} opts
 * @param {string[]} opts.targets
 * @param {number} opts.startPort
 * @param {number} opts.endPort
 * @param {boolean} opts.osScan
 * @param {(event: {event: string, data: any}) => void} opts.onProgress
 * @returns {Promise<Object>} parsed final JSON result
 */
export function runScan({ targets, startPort, endPort, osScan = true, onProgress }) {
  return new Promise((resolve, reject) => {
    if (!validateTargets(targets)) {
      return reject(new Error("One or more targets contain invalid characters"));
    }
    if (!Number.isInteger(startPort) || !Number.isInteger(endPort) || startPort < 1 || endPort > 65535 || startPort > endPort) {
      return reject(new Error("Invalid port range"));
    }

    const args = [
      SCRIPT_PATH,
      "--targets", targets.join(","),
      "--start-port", String(startPort),
      "--end-port", String(endPort),
      osScan ? "--os-scan" : "--no-os-scan",
    ];

    const child = spawn(PYTHON_BIN, args, { stdio: ["ignore", "pipe", "pipe"] });

    let stdoutBuffer = "";
    let stderrBuffer = "";

    child.stdout.on("data", (chunk) => {
      stdoutBuffer += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderrBuffer += chunk.toString();
      const lines = stderrBuffer.split("\n");
      stderrBuffer = lines.pop(); // keep incomplete last line in buffer
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line);
          if (onProgress) onProgress(event);
        } catch {
          // non-JSON stderr line (e.g. a stray traceback) — ignore for progress purposes
        }
      }
    });

    child.on("error", (err) => {
      reject(new Error(`Failed to start scan engine: ${err.message}`));
    });

    child.on("close", (code) => {
      if (code !== 0 && !stdoutBuffer.trim()) {
        return reject(new Error(`Scan engine exited with code ${code}`));
      }
      try {
        const result = JSON.parse(stdoutBuffer.trim());
        if (result.success === false) {
          return reject(new Error(result.error || "Unknown scan error"));
        }
        resolve(result);
      } catch (e) {
        reject(new Error(`Failed to parse scan engine output: ${e.message}`));
      }
    });
  });
}
