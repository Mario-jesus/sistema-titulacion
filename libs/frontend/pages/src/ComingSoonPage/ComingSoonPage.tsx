export interface ComingSoonPageProps {
  title?: string;
  description?: string;
}

export function ComingSoonPage({ 
  title = 'Próximamente', 
  description = 'Esta funcionalidad está en desarrollo y estará disponible pronto.' 
}: ComingSoonPageProps = {}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="mx-auto h-24 w-24"
            style={{ fill: 'var(--color-primary-color)' }}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
            <path d="M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z"></path>
          </svg>
        </div>
        <h1 
          className="text-3xl font-bold mb-4"
          style={{ color: 'var(--color-base-primary-typo)' }}
        >
          {title}
        </h1>
        <p 
          className="text-lg mb-8"
          style={{ color: 'var(--color-base-secondary-typo)' }}
        >
          {description}
        </p>
        <div 
          className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-3-light dark:bg-gray-3-dark"
          style={{ 
            color: 'var(--color-base-secondary-typo)'
          }}
        >
          <svg
            className="mr-2 h-5 w-5"
            style={{ fill: 'currentColor', transform: '' }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
            <path d="m13 6-6 7h4v5l6-7h-4z"></path>
          </svg>
          En desarrollo
        </div>
      </div>
    </div>
  );
}
