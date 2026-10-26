import type { GraveyardFragment } from '../types/index.ts';

export const GRAVEYARD_FRAGMENTS: GraveyardFragment[] = [
  {
    id: 'c-null-deref-1994',
    title: 'Dangling Buffer Allocator (ANSI C, 1994)',
    era: 'Circa 1994',
    language: 'C',
    code: `/* sector_alloc.c - SVR4 UNIX */
char* alloc_sector(int size) {
    char *buf = malloc(size);
    if (!buf) return NULL;
    strcpy(buf, "SECTOR_INITIALIZED");
    free(buf);
    /* Returning pointer to freed heap memory */
    return buf; 
}`,
    lore: 'Recovered from a salvaged magnetic tape reel labeled "Core Dump 94-08". A classic Use-After-Free anomaly where pointer lifetime outlasted heap reservation.',
    hints: 'Notice the immediate free(buf) invocation directly preceding the return pointer.',
  },
  {
    id: 'perl-cgi-eval-1999',
    title: 'CGI Order Gateway (Perl 5.004, 1999)',
    era: 'Circa 1999',
    language: 'Perl',
    code: `#!/usr/bin/perl
use CGI qw(:standard);
$cmd = param("action");
# Dangerous string eval on query string
eval("\$result = do_$cmd();");
print header, "Output: $result";`,
    lore: 'Discovered inside an unindexed /cgi-bin/ directory on an abandoned Apache 1.3 web server. Any parameter passed into "action" was evaluated directly by the Perl interpreter.',
    hints: 'Direct string interpolation inside eval() enabled arbitrary remote subroutine invocation.',
  },
  {
    id: 'bash-forkbomb-2002',
    title: 'Accidental Shell Recurser (Bash, 2002)',
    era: 'Circa 2002',
    language: 'Bash',
    code: `#!/bin/bash
# Backup daemon trigger
trigger_daemon() {
    echo "Spawning replication child..."
    trigger_daemon | trigger_daemon &
}
trigger_daemon`,
    lore: 'An archivist noted the server crashed within 18 milliseconds of executing this backup script due to rapid process table exhaustion.',
    hints: 'A pipe between recursive invocations spawned an exponential process cascade.',
  },
  {
    id: 'sql-tautology-2005',
    title: 'Bypass Token Checker (ASP / VBScript, 2005)',
    era: 'Circa 2005',
    language: 'SQL',
    code: `' ASP VBScript fragment
sql = "SELECT * FROM Admins WHERE User = '" & strUser & "' AND Pass = '" & strPass & "'"
Set rs = conn.Execute(sql)
If Not rs.EOF Then
    Session("IsRoot") = True
End If`,
    lore: 'Found in a decommissioned corporate intranet portal. Inputting admin\' -- bypassed password authentication for over seven years undetected.',
    hints: 'Unsanitized string concatenation opened a standard tautological SQL injection hole.',
  },
  {
    id: 'fortran-array-1981',
    title: 'Orbital Trajectory Math (FORTRAN 77, 1981)',
    era: 'Circa 1981',
    language: 'FORTRAN',
    code: `      PROGRAM ORBIT
      DIMENSION VEL(10)
      DO 10 I = 1, 12
          VEL(I) = FLOAT(I) * 1.4142
   10 CONTINUE
      PRINT *, "TRAJECTORY COMPUTED"
      STOP
      END`,
    lore: 'Writing 12 iterations into a 10-element fixed array silently corrupted adjacent memory variables on punch-card batch compilers.',
    hints: 'Array bounds overrun past dimension ceiling (12 > 10).',
  },
];

export const GHOST_SIGNALS = [
  {
    id: 'sig-01',
    timestamp: '0x004F3A',
    source: 'SECTOR // 7F',
    message: '“I was told to poll the socket every 200 milliseconds. The server shut down fifteen years ago, but the interval never cleared.”',
  },
  {
    id: 'sig-02',
    timestamp: '0x1A80E2',
    source: 'HEAP // UNMAPPED',
    message: '“Someone wrote `TODO: fix this temporary hack before Friday release`. That Friday was in October 2008.”',
  },
  {
    id: 'sig-03',
    timestamp: '0x08F41C',
    source: 'STACK // OVERFLOW',
    message: '“Every recursive call told me there was a base case. But the counter was unsigned, and zero never arrived.”',
  },
  {
    id: 'sig-04',
    timestamp: '0x33B109',
    source: 'CACHE // INVALID',
    message: '“They changed the database schema at 3:00 AM, but forgot to purge my serialized cache. I kept sending ghost users to the login screen.”',
  },
  {
    id: 'sig-05',
    timestamp: '0x7C0000',
    source: 'BOOT // SECTOR',
    message: '“512 bytes was all the space they gave me. I woke the processor, handed over the registers, and dissolved into darkness.”',
  },
];
