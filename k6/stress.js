import http from 'k6/http';
import { check, sleep } from 'k6';

// Usage: k6 run k6/stress.js
// Override URL: k6 run -e BASE_URL=https://staging.harvestai.com.ng k6/stress.js

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '60s', target: 10 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.02'],
  },
};

const BASE = __ENV.BASE_URL || 'https://harvestai.com.ng';

export default function () {
  const home = http.get(`${BASE}/`);
  check(home, {
    'homepage 200': (r) => r.status === 200,
    'homepage <1s': (r) => r.timings.duration < 1000,
  });

  const pricing = http.get(`${BASE}/pricing`);
  check(pricing, { 'pricing 200': (r) => r.status === 200 });

  const blog = http.get(`${BASE}/blog`);
  check(blog, { 'blog 200': (r) => r.status === 200 });

  sleep(1);
}
