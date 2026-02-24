import Image from 'next/image';

export default function ScreenerImagePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#181818] text-white">
      <h1 className="text-3xl font-bold mb-6">Stock Screener Overview</h1>
      <div className="w-full max-w-5xl bg-[#232323] rounded-lg shadow-lg p-6 flex flex-col items-center">
        <Image
          src="/screener-sample.png"
          alt="Stock Screener Example"
          width={1200}
          height={800}
          className="rounded-md border border-gray-700 shadow"
        />
        <p className="mt-4 text-gray-300 text-center max-w-2xl">
          This is a sample image of the Stock Screener tool. Use the screener to filter, sort, and analyze stocks based on a variety of metrics and criteria. The screener helps you discover investment opportunities and make informed decisions.
        </p>
      </div>
    </div>
  );
}
