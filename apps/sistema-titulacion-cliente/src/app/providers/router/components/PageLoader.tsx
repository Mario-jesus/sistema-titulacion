export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 rounded-full border-(--color-gray-1) border-t-(--color-primary-color) animate-spin"></div>
        <p className="m-0 text-base text-(--color-base-secondary-typo)">
          Cargando...
        </p>
      </div>
    </div>
  );
}
