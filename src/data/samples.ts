import type { SampleSnippet } from '../types/index.ts';

export const SAMPLE_SNIPPETS: SampleSnippet[] = [
  {
    id: 'jquery-dom',
    label: 'Old jQuery DOM & Ajax',
    title: 'Customer Order Submission Handler (jQuery 1.8)',
    language: 'JavaScript',
    description: 'A legacy 2012 jQuery event listener and synchronous-style AJAX form submission with direct DOM concatenation.',
    code: `$(document).ready(function() {
  $("#submit-order-btn").live("click", function(e) {
    e.preventDefault();
    var customerId = $("#cust_id").val();
    var items = [];
    $(".item-row").each(function() {
      var id = $(this).attr("data-id");
      var qty = $(this).find("input.qty").val();
      items.push({ id: id, qty: qty });
    });

    // Synchronous request block
    $.ajax({
      url: "/process_order.php?v=" + Math.random(),
      type: "POST",
      async: false,
      data: { cid: customerId, cart: JSON.stringify(items) },
      success: function(resp) {
        var data = eval("(" + resp + ")");
        if (data.status == "OK") {
          $("#cart-summary").html("<div class='success'>Order #" + data.orderId + " placed for " + data.customerName + "!</div>");
        } else {
          alert("Error: " + data.msg);
        }
      },
      error: function() {
        alert("Server failed!");
      }
    });
  });
});`,
    sampleResult: {
      id: 'sample-jquery-dom',
      title: 'Customer Order Submission Handler (jQuery 1.8)',
      timestamp: Date.now(),
      language: 'JavaScript',
      mode: 'seance',
      originalCode: `$(document).ready(function() {
  $("#submit-order-btn").live("click", function(e) {
    ...
  });
});`,
      summary: 'Legacy jQuery event listener managing cart extraction, synchronous AJAX submission, eval-based JSON deserialization, and unescaped HTML template string injection into the DOM.',
      ghostWhisper: '“I once watched countless shopping carts depart under fluorescent CRT monitors. Every checkout button cried out to me through .live(), until the browser froze mid-transaction on a synchronous pulse no modern thread remembers.”',
      confidence: 'high',
      isSample: true,
      modelUsed: 'Gemma 4 (Prewritten Archival Demonstration)',
      findings: [
        {
          title: 'Deprecated .live() Event Delegation',
          severity: 'high',
          excerpt: '$("#submit-order-btn").live("click", function(e) {',
          description: 'jQuery .live() was deprecated in 1.7 and removed completely in 1.9. In modern jQuery or native environments, it will throw an uncaught TypeError.',
          remediation: 'Use standard addEventListener or modern delegated event listeners via document.querySelector.'
        },
        {
          title: 'Synchronous XMLHttpRequest (async: false)',
          severity: 'high',
          excerpt: 'async: false,',
          description: 'Synchronous XHR blocks the browser main UI thread entirely, causing frozen tabs, unresponsive interaction, and browser console deprecation warnings.',
          remediation: 'Migrate to asynchronous fetch() with async/await and abort signal timeouts.'
        },
        {
          title: 'Dangerous eval() Deserialization',
          severity: 'high',
          excerpt: 'var data = eval("(" + resp + ")");',
          description: 'Evaluating arbitrary server strings as raw executable JavaScript creates severe code injection risks if the endpoint output is manipulated or intercepted.',
          remediation: 'Use standard JSON.parse() or native response.json().'
        },
        {
          title: 'Cross-Site Scripting (XSS) via Direct HTML Concatenation',
          severity: 'medium',
          excerpt: '$("#cart-summary").html("<div class=\'success\'>Order #" + data.orderId + ...',
          description: 'Injecting raw unescaped values (such as data.customerName) into .html() allows malicious scripts stored in user profiles to execute in the victim browser.',
          remediation: 'Use textContent, DOM createElement, or sanitized framework templates.'
        }
      ],
      modernizedCode: `// Modern TypeScript / ES2024 implementation
interface CartItem {
  id: string;
  qty: number;
}

interface OrderResponse {
  status: 'OK' | 'ERROR';
  orderId?: string;
  customerName?: string;
  msg?: string;
}

async function handleOrderSubmission(event: SubmitEvent): Promise<void> {
  event.preventDefault();

  const form = event.currentTarget as HTMLFormElement;
  const submitBtn = form.querySelector<HTMLButtonElement>('#submit-order-btn');
  const summaryEl = document.querySelector<HTMLElement>('#cart-summary');
  const custInput = form.querySelector<HTMLInputElement>('#cust_id');

  if (!custInput || !summaryEl) return;

  const items: CartItem[] = Array.from(
    form.querySelectorAll<HTMLElement>('.item-row')
  ).map((row) => ({
    id: row.dataset.id ?? '',
    qty: Number(row.querySelector<HTMLInputElement>('input.qty')?.value || 0),
  }));

  try {
    if (submitBtn) submitBtn.disabled = true;

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        customerId: custInput.value.trim(),
        cart: items,
      }),
    });

    if (!response.ok) {
      throw new Error(\`Network response failed with status \${response.status}\`);
    }

    const data: OrderResponse = await response.json();

    if (data.status === 'OK' && data.orderId) {
      // Safe DOM construction preventing XSS injection
      summaryEl.replaceChildren();
      const successDiv = document.createElement('div');
      successDiv.className = 'success';
      successDiv.textContent = \`Order #\${data.orderId} placed for \${data.customerName ?? 'Customer'}!\`;
      summaryEl.appendChild(successDiv);
    } else {
      throw new Error(data.msg ?? 'Order placement was rejected by server');
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown communication error';
    console.error('Order submission error:', err);
    summaryEl.textContent = \`Failed to process order: \${errorMsg}\`;
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

// Attach listener cleanly
document.querySelector('#order-form')?.addEventListener('submit', handleOrderSubmission as EventListener);`,
      explanations: [
        'Replaced removed .live() delegation with standard DOM submit event listener.',
        'Eliminated UI-freezing synchronous AJAX in favor of async/await fetch() with proper headers.',
        'Replaced dangerous eval() with native response.json() schema validation.',
        'Mitigated stored and reflected XSS vulnerabilities by using textContent and replaceChildren() instead of string concatenation.'
      ],
      caveats: [
        'Requires updating server endpoint from /process_order.php query string format to standard JSON payload.',
        'Requires an actual <form id="order-form"> wrapper around the inputs for valid semantic accessibility.',
        'Assumes backend supports modern CORS and application/json headers.'
      ],
      suggestedTests: [
        'Verify cart submission with empty items and non-numeric quantities.',
        'Test error state when the server returns 500 or 403 HTTP status.',
        'Ensure customerName containing <script> tags or angle brackets renders as plain harmless text.'
      ]
    }
  },
  {
    id: 'php-legacy-mysql',
    label: 'Legacy PHP & MySQL',
    title: 'User Authenticator Script (PHP 5.2 / mysql_*)',
    language: 'PHP',
    description: 'An old 2006 PHP procedural authentication script with deprecated mysql_query and MD5 password comparison.',
    code: `<?php
// auth_user.php - Last modified: 2006-11-14 by admin
require_once("db_conn.php");

$username = $_POST['username'];
$password = $_POST['password'];

if (empty($username) || empty($password)) {
    die("Please fill all fields");
}

// Check credentials
$hash = md5($password);
$query = "SELECT id, username, role FROM users WHERE username = '$username' AND password = '$hash'";
$result = mysql_query($query);

if (!$result) {
    die("Database error: " . mysql_error());
}

if (mysql_num_rows($result) == 1) {
    $row = mysql_fetch_assoc($result);
    setcookie("user_session", $row['id'] . ":" . $row['role'], time() + 3600);
    header("Location: /admin/dashboard.php");
    exit();
} else {
    echo "<h3>Login failed</h3>";
    echo "<a href='/login.html'>Try again</a>";
}`,
    sampleResult: {
      id: 'sample-php-legacy',
      title: 'User Authenticator Script (PHP 5.2 / mysql_*)',
      timestamp: Date.now(),
      language: 'PHP',
      mode: 'autopsy',
      originalCode: `<?php
require_once("db_conn.php");
$username = $_POST['username'];
$query = "SELECT id, username, role FROM users WHERE username = '$username' AND password = '$hash'";
$result = mysql_query($query);
...`,
      summary: 'Procedural authentication routine demonstrating SQL injection vulnerability, weak broken MD5 hashing, unverified tamperable plaintext cookies, and completely removed mysql_* extensions.',
      ghostWhisper: '“I guarded the doorway for twenty seasons with an unescaped gate. Anyone who whispered `\' OR 1=1 --` could step inside without knocking, yet they blamed the silence for what entered.”',
      confidence: 'high',
      isSample: true,
      modelUsed: 'Gemma 4 (Prewritten Archival Demonstration)',
      findings: [
        {
          title: 'Critical SQL Injection Vulnerability',
          severity: 'high',
          excerpt: '"SELECT id, username, role FROM users WHERE username = \'$username\' AND ..."',
          description: 'The raw $_POST[\'username\'] input is interpolated directly into the query string without escaping or prepared statements, allowing authentication bypass and database exfiltration.',
          remediation: 'Use PDO or MySQLi with parameterized prepared statements (:username).'
        },
        {
          title: 'Removed mysql_* Extension (Fatal in PHP 7+)',
          severity: 'high',
          excerpt: 'mysql_query($query); mysql_fetch_assoc($result);',
          description: 'The legacy mysql_* function extension was deprecated in PHP 5.5 and removed in PHP 7.0. Running this code in modern PHP causes an immediate fatal error: Call to undefined function.',
          remediation: 'Migrate to PDO (PHP Data Objects).'
        },
        {
          title: 'Cryptographically Broken MD5 Hashing',
          severity: 'high',
          excerpt: '$hash = md5($password);',
          description: 'MD5 is vulnerable to collision attacks and rainbow tables, offering virtually zero brute-force resistance against modern GPU cracking rigs.',
          remediation: 'Use password_hash() and password_verify() with Argon2id or bcrypt.'
        },
        {
          title: 'Unsigned, Plaintext Session Cookie Tampering',
          severity: 'medium',
          excerpt: 'setcookie("user_session", $row[\'id\'] . ":" . $row[\'role\'], time() + 3600);',
          description: 'Storing unencrypted user IDs and permission roles directly in an insecure client cookie allows any user to edit their browser cookie to role=admin and escalate privileges.',
          remediation: 'Use server-side sessions with session_start() and secure, HTTP-only cookie flags.'
        }
      ],
      modernizedCode: `<?php
declare(strict_types=1);

// Modern PHP 8.2+ Authentication Handler with PDO & Argon2/Bcrypt
session_start([
    'cookie_httponly' => true,
    'cookie_secure' => true,
    'cookie_samesite' => 'Strict',
]);

require_once __DIR__ . '/db.php'; // Exports a configured PDO instance $pdo

$username = trim((string)($_POST['username'] ?? ''));
$password = (string)($_POST['password'] ?? '');

if ($username === '' || $password === '') {
    http_response_code(400);
    exit('Username and password are required.');
}

try {
    $stmt = $pdo->prepare(
        'SELECT id, username, password_hash, role 
         FROM users 
         WHERE username = :username 
         LIMIT 1'
    );
    $stmt->execute([':username' => $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hash'])) {
        // Prevent session fixation
        session_regenerate_id(true);

        $_SESSION['user_id'] = (int)$user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];

        // Automatic rehash if algorithm parameters have improved
        if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
            $newHash = password_hash($password, PASSWORD_DEFAULT);
            $rehashStmt = $pdo->prepare('UPDATE users SET password_hash = :hash WHERE id = :id');
            $rehashStmt->execute([':hash' => $newHash, ':id' => $user['id']]);
        }

        header('Location: /admin/dashboard.php');
        exit;
    }

    // Generic error to prevent user enumeration
    http_response_code(401);
    echo '<h3>Invalid credentials. Please verify your login details.</h3>';
} catch (PDOException $e) {
    error_log('Database error during authentication: ' . $e->getMessage());
    http_response_code(500);
    echo '<h3>An unexpected error occurred. Please try again later.</h3>';
}`,
      explanations: [
        'Employed PDO prepared statement with named parameters to eliminate SQL injection.',
        'Swapped MD5 with industry standard password_verify() and automatic password_needs_rehash().',
        'Replaced client-side role cookie with server-authoritative PHP session with HttpOnly and SameSite flags.',
        'Added session_regenerate_id(true) to guard against session fixation attacks.'
      ],
      caveats: [
        'Existing database records stored with MD5 must be migrated or converted upon the user next successful login.',
        'Requires PHP 8.1+ with pdo_mysql extension enabled.',
        'HTTPS is required due to cookie_secure flag.'
      ],
      suggestedTests: [
        'Attempt login with SQL payload "\' OR \'1\'=\'1" and verify query executes safely without match.',
        'Test password verification with both valid and invalid passwords.',
        'Inspect Set-Cookie headers to verify HttpOnly and Secure flags.'
      ]
    }
  },
  {
    id: 'js-callback-hell',
    label: 'Callback Pyramid of Doom',
    title: 'Asset Loading & Config Hydration (Node 0.10)',
    language: 'JavaScript',
    description: 'Nested Node.js callback pyramid reading filesystem files, checking permissions, parsing config, and making sequential HTTP requests.',
    code: `var fs = require('fs');
var http = require('http');

function loadSystemConfig(configPath, callback) {
  fs.exists(configPath, function(exists) {
    if (!exists) {
      return callback(new Error("Config file missing"));
    }
    fs.readFile(configPath, 'utf8', function(err, data) {
      if (err) {
        return callback(err);
      }
      var config;
      try {
        config = JSON.parse(data);
      } catch (e) {
        return callback(new Error("JSON parse error: " + e.message));
      }
      
      http.get(config.remoteRegistryUrl, function(res) {
        var body = '';
        res.on('data', function(chunk) {
          body += chunk;
        });
        res.on('end', function() {
          try {
            var registry = JSON.parse(body);
            config.registry = registry;
            fs.writeFile('/tmp/system.cache', JSON.stringify(config), function(writeErr) {
              if (writeErr) {
                return callback(writeErr);
              }
              callback(null, config);
            });
          } catch (regErr) {
            callback(regErr);
          }
        });
      }).on('error', function(netErr) {
        callback(netErr);
      });
    });
  });
}`,
    sampleResult: {
      id: 'sample-js-callback',
      title: 'Asset Loading & Config Hydration (Node 0.10)',
      timestamp: Date.now(),
      language: 'JavaScript',
      mode: 'resurrection',
      originalCode: `function loadSystemConfig(configPath, callback) {
  fs.exists(configPath, function(exists) {
    fs.readFile(configPath, 'utf8', function(err, data) {
      http.get(config.remoteRegistryUrl, function(res) {
        ...
      });
    });
  });
}`,
      summary: 'Deeply indented asynchronous pyramid of doom exhibiting race conditions via deprecated fs.exists, fragile stream concatenation without error handling, and manual nested callback plumbing.',
      ghostWhisper: '“Every indent was a step deeper into the pit. Five levels under, an uncaught stream error swallowed our screams, and the thread fell asleep with its hand still outstretched.”',
      confidence: 'high',
      isSample: true,
      modelUsed: 'Gemma 4 (Prewritten Archival Demonstration)',
      findings: [
        {
          title: 'Deprecated fs.exists Race Condition',
          severity: 'medium',
          excerpt: 'fs.exists(configPath, function(exists) {',
          description: 'Checking file existence before reading creates a Time-of-Check to Time-of-Use (TOCTOU) race condition. The file can be deleted or locked between the check and readFile call.',
          remediation: 'Read the file directly and catch ENOENT error codes.'
        },
        {
          title: 'Unbuffered HTTP Response Stream Exhaustion',
          severity: 'medium',
          excerpt: 'res.on(\'data\', function(chunk) { body += chunk; });',
          description: 'If the remote registry returns an unexpectedly large response or non-UTF8 binary stream, concatenating raw chunks in memory risks heap allocation spikes without content-length validation.',
          remediation: 'Use stream pipeline or fetch API with bounded limits.'
        },
        {
          title: 'Hardcoded Insecure /tmp Cache Location',
          severity: 'low',
          excerpt: 'fs.writeFile(\'/tmp/system.cache\', ...)',
          description: 'Writing sensitive system configuration into shared world-writable /tmp can expose API keys or credentials to local multi-tenant processes.',
          remediation: 'Use os.tmpdir() with secured file permissions (mode 0o600).'
        }
      ],
      modernizedCode: `import { readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export interface SystemConfig {
  remoteRegistryUrl: string;
  registry?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Loads system configuration, hydrations registry metadata, and safely caches result.
 */
export async function loadSystemConfig(configPath: string): Promise<SystemConfig> {
  // 1. Read config directly (avoids TOCTOU race condition of fs.exists)
  let rawConfig: string;
  try {
    rawConfig = await readFile(configPath, 'utf-8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(\`Config file not found at: \${configPath}\`);
    }
    throw err;
  }

  const config: SystemConfig = JSON.parse(rawConfig);

  if (!config.remoteRegistryUrl) {
    throw new Error('Config missing required "remoteRegistryUrl" property');
  }

  // 2. Fetch remote registry with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  let registryData: Record<string, unknown>;
  try {
    const res = await fetch(config.remoteRegistryUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(\`Remote registry returned HTTP \${res.status}: \${res.statusText}\`);
    }

    registryData = (await res.json()) as Record<string, unknown>;
  } finally {
    clearTimeout(timeoutId);
  }

  config.registry = registryData;

  // 3. Securely cache in OS temp directory with 0o600 permissions
  const cachePath = join(tmpdir(), 'system.cache.json');
  await writeFile(cachePath, JSON.stringify(config, null, 2), {
    encoding: 'utf-8',
    mode: 0o600,
  });

  return config;
}`,
      explanations: [
        'Transformed 5-level nested callback pyramid into clean async/await pipeline using node:fs/promises.',
        'Eliminated TOCTOU race condition by removing deprecated fs.exists in favor of direct error interception.',
        'Modernized network transport using native fetch() with AbortController timeout protection.',
        'Secured cache write using os.tmpdir() and strict 0o600 file permission mask.'
      ],
      caveats: [
        'Requires Node.js 18+ for native fetch and node: prefix imports.',
        'Calling functions must await loadSystemConfig() rather than passing a Node error-first callback.'
      ],
      suggestedTests: [
        'Test behavior when config file does not exist (verify ENOENT error handling).',
        'Test timeout behavior when remoteRegistryUrl takes longer than 8 seconds to respond.',
        'Verify JSON formatting of cache output file in tmpdir.'
      ]
    }
  },
  {
    id: 'cobol-payroll',
    label: 'COBOL Batch Record',
    title: 'Payroll Calculation Routine (COBOL-74)',
    language: 'COBOL',
    description: 'A legacy mainframe COBOL calculation paragraph with fixed column formatting, COMP-3 packed decimals, and GO TO branching.',
    code: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. PAYCALC.
       AUTHOR. J_DOE_1984.
       ENVIRONMENT DIVISION.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-EMP-RECORD.
           05  WS-EMP-ID          PIC X(6).
           05  WS-HOURS-WORKED    PIC 99V99.
           05  WS-HOURLY-RATE     PIC 99V99.
           05  WS-GROSS-PAY       PIC 9999V99.
           05  WS-TAX-DEDUCT      PIC 999V99.
           05  WS-NET-PAY         PIC 9999V99.
       01  WS-OVERTIME-HOURS      PIC 99V99 VALUE ZERO.
       01  WS-OVERTIME-PAY        PIC 999V99 VALUE ZERO.

       PROCEDURE DIVISION.
       0000-MAIN-LOGIC.
           IF WS-HOURS-WORKED > 40.00
               GO TO 1000-CALC-OVERTIME
           ELSE
               COMPUTE WS-GROSS-PAY = WS-HOURS-WORKED * WS-HOURLY-RATE
               GO TO 2000-CALC-TAXES.

       1000-CALC-OVERTIME.
           COMPUTE WS-OVERTIME-HOURS = WS-HOURS-WORKED - 40.00
           COMPUTE WS-OVERTIME-PAY = WS-OVERTIME-HOURS * (WS-HOURLY-RATE * 1.5)
           COMPUTE WS-GROSS-PAY = (40.00 * WS-HOURLY-RATE) + WS-OVERTIME-PAY.

       2000-CALC-TAXES.
           COMPUTE WS-TAX-DEDUCT = WS-GROSS-PAY * 0.15
           COMPUTE WS-NET-PAY = WS-GROSS-PAY - WS-TAX-DEDUCT
           DISPLAY "NET PAY CALCULATED FOR ID: " WS-EMP-ID.
           STOP RUN.`,
    sampleResult: {
      id: 'sample-cobol-payroll',
      title: 'Payroll Calculation Routine (COBOL-74)',
      timestamp: Date.now(),
      language: 'COBOL',
      mode: 'seance',
      originalCode: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. PAYCALC.
       ...
       IF WS-HOURS-WORKED > 40.00
           GO TO 1000-CALC-OVERTIME
       ...`,
      summary: 'Mainframe batch payroll calculation routine computing standard and overtime wages with fixed flat-rate 15% tax deduction using archaic unstructured GO TO branches.',
      ghostWhisper: '“I ticked inside magnetic tape reels before your parents held hands. Thousands of workers ate dinner because my 40-hour split held firm, but no one rewrote the tax tables when 1986 passed.”',
      confidence: 'high',
      isSample: true,
      modelUsed: 'Gemma 4 (Prewritten Archival Demonstration)',
      findings: [
        {
          title: 'Unstructured Spaghetti Branching (GO TO)',
          severity: 'medium',
          excerpt: 'GO TO 1000-CALC-OVERTIME ... GO TO 2000-CALC-TAXES',
          description: 'Arbitrary control flow jumping across paragraphs breaks modular reasoning and makes stack inspection difficult.',
          remediation: 'Replace GO TO with structured inline PERFORM blocks or modern functional logic.'
        },
        {
          title: 'Fixed Truncation Risk (PIC 9999V99)',
          severity: 'medium',
          excerpt: '05  WS-GROSS-PAY PIC 9999V99.',
          description: 'Max gross pay is 9,999.99 before silent arithmetic truncation occurs in standard COBOL compiler modes.',
          remediation: 'Expand storage picture clause or use arbitrary-precision decimal representations.'
        },
        {
          title: 'Hardcoded Flat Tax Assumption',
          severity: 'informational',
          excerpt: 'COMPUTE WS-TAX-DEDUCT = WS-GROSS-PAY * 0.15',
          description: 'Hardcoding a static 15% tax bracket disregards progressive taxation, state withholdings, and tax exemptions.',
          remediation: 'Decouple tax calculation into configurable policy engines.'
        }
      ],
      modernizedCode: `// Modern TypeScript / Python microservice replacement
export interface EmployeeTimesheet {
  employeeId: string;
  hoursWorked: number;
  hourlyRate: number;
}

export interface PayrollCalculationResult {
  employeeId: string;
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  grossPay: number;
  taxDeduction: number;
  netPay: number;
}

/**
 * Calculates payroll with explicit overtime multiplier and tax withholding.
 */
export function calculatePayroll(timesheet: EmployeeTimesheet, taxRate = 0.15): PayrollCalculationResult {
  const { employeeId, hoursWorked, hourlyRate } = timesheet;

  if (hoursWorked < 0 || hourlyRate < 0) {
    throw new RangeError('Hours worked and hourly rate must be non-negative values');
  }

  const standardLimit = 40.0;
  const regularHours = Math.min(hoursWorked, standardLimit);
  const overtimeHours = Math.max(0, hoursWorked - standardLimit);

  const regularPay = Number((regularHours * hourlyRate).toFixed(2));
  const overtimePay = Number((overtimeHours * (hourlyRate * 1.5)).toFixed(2));
  const grossPay = Number((regularPay + overtimePay).toFixed(2));

  const taxDeduction = Number((grossPay * taxRate).toFixed(2));
  const netPay = Number((grossPay - taxDeduction).toFixed(2));

  return {
    employeeId,
    regularHours,
    overtimeHours,
    regularPay,
    overtimePay,
    grossPay,
    taxDeduction,
    netPay,
  };
}`,
      explanations: [
        'Eliminated GO TO jumping with purely functional, testable mathematics.',
        'Extracted calculation parameters (standard 40h limit, 1.5x overtime rate, tax rate) to prevent hardcoding.',
        'Guarded against negative values and arithmetic overflow.'
      ],
      caveats: [
        'Mainframe systems often used Banker\'s Rounding (round half to even) rather than standard arithmetic rounding.',
        'COBOL files may expect fixed-width string record serialization when sending results downstream.'
      ],
      suggestedTests: [
        'Verify zero hours worked outputs zero net pay.',
        'Verify exactly 40 hours worked triggers zero overtime pay.',
        'Test fractional hours (e.g., 42.5 hours) with rounding accuracy.'
      ]
    }
  }
];
