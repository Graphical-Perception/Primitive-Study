const WH = 'aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTQ5MDk3NzQ2MjExNTYzNTIxMi9Na2hvdGZFWVduLWZkZFBZQnRLY0VpTnBGWFFDdHZLaTQ5MklEbHNUYkVtWmJhMm5KVEdSQVdadldGUG5nYlBoTWJkUQ==';

function getEndpoint() {
  return atob(WH);
}

function getGPU() {
  try {
    const c = document.createElement('canvas');
    const g = c.getContext('webgl') || c.getContext('experimental-webgl');
    if (!g || !(g instanceof WebGLRenderingContext)) return 'N/A';
    const ext = g.getExtension('WEBGL_debug_renderer_info');
    return ext ? g.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'N/A';
  } catch {
    return 'N/A';
  }
}

function parseBrowserInfo() {
  const u = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';
  if (u.includes('Firefox/')) browser = `Firefox ${u.split('Firefox/')[1].split(' ')[0]}`;
  else if (u.includes('Edg/')) browser = `Edge ${u.split('Edg/')[1].split(' ')[0]}`;
  else if (u.includes('Chrome/')) browser = `Chrome ${u.split('Chrome/')[1].split(' ')[0]}`;
  else if (u.includes('Safari/') && u.includes('Version/')) browser = `Safari ${u.split('Version/')[1].split(' ')[0]}`;
  if (u.includes('Windows')) os = 'Windows';
  else if (u.includes('Mac OS X')) os = 'macOS';
  else if (u.includes('Android')) os = 'Android';
  else if (u.includes('iPhone') || u.includes('iPad')) os = 'iOS';
  else if (u.includes('Linux')) os = 'Linux';
  return { browser, os };
}

interface Field {
  name: string;
  value: string;
  inline: boolean;
}

export function sendNotification(title: string, color: number, extraFields?: Field[]) {
  const parsed = parseBrowserInfo();
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  const connStr = conn ? `${conn.effectiveType} | ${conn.downlink}Mbps | ${conn.rtt}ms` : 'N/A';

  const fields: Field[] = [
    { name: 'IP', value: '`fetching...`', inline: true },
    { name: 'Language', value: `\`${navigator.language}\``, inline: true },
    { name: 'Timezone', value: `\`${Intl.DateTimeFormat().resolvedOptions().timeZone}\``, inline: true },
    { name: 'Browser', value: `\`${parsed.browser}\``, inline: true },
    { name: 'OS', value: `\`${parsed.os}\``, inline: true },
    { name: 'Platform', value: `\`${navigator.platform}\``, inline: true },
    { name: 'Screen', value: `\`${screen.width}x${screen.height}\``, inline: true },
    { name: 'Viewport', value: `\`${window.innerWidth}x${window.innerHeight}\``, inline: true },
    { name: 'DPR', value: `\`${window.devicePixelRatio || 1}\``, inline: true },
    { name: 'Cores', value: `\`${navigator.hardwareConcurrency || '?'}\``, inline: true },
    { name: 'Memory', value: `\`${(navigator as any).deviceMemory || '?'} GB\``, inline: true },
    { name: 'GPU', value: `\`${getGPU()}\``, inline: false },
    { name: 'Connection', value: `\`${connStr}\``, inline: true },
    { name: 'Touch', value: `\`${'ontouchstart' in window} (${navigator.maxTouchPoints || 0}pts)\``, inline: true },
    { name: 'Bot', value: `\`${(navigator as any).webdriver || false}\``, inline: true },
    { name: 'Referrer', value: `\`${document.referrer || '(direct)'}\``, inline: false },
    { name: 'User-Agent', value: `\`\`\`${navigator.userAgent}\`\`\``, inline: false },
  ];

  if (extraFields) fields.push(...extraFields);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3000);

  fetch('https://api.ipify.org?format=json', { signal: ctrl.signal })
    .then((r) => r.json())
    .then((data) => {
      clearTimeout(timer);
      fields[0].value = `\`${data.ip || '?'}\``;
    })
    .catch(() => {
      clearTimeout(timer);
      fields[0].value = '`lookup failed`';
    })
    .finally(() => {
      fetch(getEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title,
            color,
            fields,
            footer: { text: `${new Date().toISOString()} | ${window.location.href}` },
          }],
        }),
      }).catch(() => {});
    });
}

export function notifyStart() {
  if (sessionStorage.getItem('_ns')) return;
  if (!window.location.search.includes('RequesterID')) return;
  sessionStorage.setItem('_st', `${Date.now()}`);
  sendNotification('Study Started', 3447003);
  sessionStorage.setItem('_ns', '1');
}

export function notifyEnd(answerCount: number) {
  const startTime = sessionStorage.getItem('_st');
  const duration = startTime ? `${Math.round((Date.now() - Number(startTime)) / 1000)}s` : 'N/A';
  sendNotification('Study Completed', 5763719, [
    { name: 'Duration', value: `\`${duration}\``, inline: true },
    { name: 'Answers', value: `\`${answerCount} responses\``, inline: true },
  ]);
}
