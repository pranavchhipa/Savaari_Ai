import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Sarathi AI - Road Trips Reimagined';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to right, #2563EB, #7C3AED)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        background: 'white',
                        marginBottom: '40px',
                        color: '#2563EB',
                        fontSize: '100px',
                        fontWeight: 'bold',
                        fontFamily: 'sans-serif',
                    }}
                >
                    S
                </div>
                <div style={{ fontSize: '80px', fontWeight: 'bold', marginBottom: '20px', fontFamily: 'sans-serif' }}>
                    Sarathi AI
                </div>
                <div style={{ fontSize: '32px', fontFamily: 'sans-serif', opacity: 0.9 }}>
                    Road Trips, Reimagined
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
