'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          textAlign: 'center',
          fontFamily: 'sans-serif',
          padding: '20px'
        }}>
          <h2 style={{ color: '#000', marginBottom: '10px' }}>Eroare de Sistem</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>A apărut o eroare critică la nivelul aplicației.</p>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Reîncearcă
          </button>
        </div>
      </body>
    </html>
  );
}
