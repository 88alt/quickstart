#!/usr/bin/env python3
"""B-only authenticated homepage acceptance; temporary root sessions destroyed.

This intentionally exercises homepage configuration writes, restoring the
captured baseline through optimistic versions. It never changes network policy.
"""
import datetime
import json
import os
from pathlib import Path
import secrets
import shlex
import subprocess
import sys

HOST = '192.168.30.244'
OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=False)


def remote(command):
    return subprocess.check_output(['ssh', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=5', 'root@' + HOST, command], text=True, timeout=30)


def ubus(method, data):
    result = remote('ubus -S call session ' + method + ' ' + shlex.quote(json.dumps(data)))
    return json.loads(result) if result.strip() else {}


sessions = []
report = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'host': HOST,
          'scope': 'homepage-config-only', 'board': json.loads(remote('ubus call system board')),
          'version': remote('/usr/sbin/quickstart version --more').strip(),
          'fingerprints': remote('sha256sum /usr/sbin/quickstart /www/luci-static/quickstart/index.js /www/luci-static/quickstart/i18n/en.json').strip().splitlines()}
try:
    for _ in range(2):
        sid = ubus('create', {'timeout': 900})['ubus_rpc_session']
        sessions.append(sid)
        ubus('set', {'ubus_rpc_session': sid, 'values': {'username': 'root', 'token': secrets.token_hex(16)}})
        for scope, objects in [('ubus', [['*', '*']]), ('access-group', [['*', 'read']]), ('uci', [['*', 'read']])]:
            ubus('grant', {'ubus_rpc_session': sid, 'scope': scope, 'objects': objects})
    env = dict(os.environ, NODE_PATH='/config/playwright-runner/node_modules', QS_ACCEPT_HOST=HOST,
               QS_ACCEPT_SID=sessions[0], QS_ACCEPT_SECOND_SID=sessions[1], QS_ACCEPT_OUT=str(OUT.resolve()))
    result = subprocess.run(['node', str(Path(__file__).with_name('home-current-acceptance.cjs'))], env=env, timeout=480)
    report['uiExitCode'] = result.returncode
finally:
    for sid in sessions:
        ubus('destroy', {'ubus_rpc_session': sid})
    report['sessionsDestroyed'] = len(sessions)
    (OUT / 'device.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(report, ensure_ascii=False, indent=2))
sys.exit(report.get('uiExitCode', 1))
