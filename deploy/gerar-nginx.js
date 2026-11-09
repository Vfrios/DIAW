const fs = require('node:fs');
const path = require('node:path');
const { assignPorts, loadAndValidate } = require('./validate');

const outputPath = process.argv[2] || path.join(__dirname, '..', 'nginx.conf.template');
const projects = assignPorts(loadAndValidate());
const locations = [];
const menuLink = `
        sub_filter '</body>' '<a href="/" class="diaw-menu-voltar" aria-label="Voltar ao menu de projetos">Voltar ao menu</a><style>.diaw-menu-voltar{position:fixed;top:16px;right:16px;z-index:2147483647;padding:10px 16px;border:2px solid #fff;border-radius:999px;background:#16213a;color:#fff;font:600 14px/1.2 system-ui,sans-serif;text-decoration:none;box-shadow:0 2px 10px #0005}.diaw-menu-voltar:hover{background:#26385f}.diaw-menu-voltar:focus-visible{outline:3px solid #ffd84a;outline-offset:3px}</style></body>';`;

for (const project of projects) {
  if (project.tipo === 'estatico') {
    locations.push(`
    location = /${project.slug} {
        return 301 /${project.slug}/;
    }
    location ^~ /${project.slug}/ {
${menuLink}
        try_files $uri $uri/ /${project.slug}/index.html;
    }`);
    continue;
  }

  locations.push(`
    location = /${project.slug} {
        return 301 /${project.slug}/;
    }
    location ^~ /${project.slug}/ {
${menuLink}
        mirror /_internal/touch/${project.slug};
        mirror_request_body off;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Accept-Encoding "";
        proxy_pass http://127.0.0.1:${project.porta};
        proxy_read_timeout 120s;
    }
    location = /_internal/touch/${project.slug} {
        internal;
        proxy_pass http://127.0.0.1:3001/_internal/touch/${project.slug};
    }`);
}

const config = `worker_processes 1;
pid /var/run/nginx.pid;
error_log /dev/stderr warn;

events {
    worker_connections 128;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    access_log off;
    sendfile on;
    keepalive_timeout 30;

    server {
        listen \${PORT};
        server_name _;
        root /usr/share/nginx/html;
        index index.html;
        client_max_body_size 2m;

        location = /healthz {
            access_log off;
            default_type text/plain;
            return 200 "ok\\n";
        }
        location = /_status {
            proxy_set_header X-Real-IP $remote_addr;
            proxy_pass http://127.0.0.1:3001/_status;
        }
        location ^~ /_api/ {
            proxy_set_header X-Real-IP $remote_addr;
            proxy_pass http://127.0.0.1:3001/_api/;
        }
${locations.join('\n')}
        location / {
            try_files $uri $uri/ =404;
        }
    }
}
`;

fs.writeFileSync(outputPath, config);
console.log(`Configuração Nginx gerada em ${outputPath}.`);
