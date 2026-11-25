import { ImageResponse } from 'next/og';

export const alt =
  'CronLens — build, validate, and understand cron schedules at a glance';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          color: '#e5eef7',
          background:
            'radial-gradient(ellipse at 82% 16%, #16344a 0%, #08111f 48%)',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            color: '#36d1dc',
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid #36d1dc',
              borderRadius: 14,
              fontSize: 25,
            }}
          >
            *
          </div>
          CRONLENS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              color: '#8da5b8',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 4,
            }}
          >
            CRON EXPRESSION WORKBENCH
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: 850,
              fontSize: 76,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: -3,
            }}
          >
            <span>Every schedule,</span>
            <span>in clear view.</span>
          </div>
          <div style={{ color: '#8da5b8', fontSize: 25 }}>
            Build it. Read it. Know exactly when it runs.
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            color: '#8da5b8',
            fontSize: 18,
          }}
        >
          <span style={{ color: '#36d1dc' }}>*/5 * * * *</span>
          <span>·</span>
          Live translation
          <span>·</span>
          Next run previews
        </div>
      </div>
    ),
    size,
  );
}
