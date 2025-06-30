export default function FeedPage() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gold-50 via-white to-green-50 text-[#18122B]">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-[#231942] flex flex-col items-center py-8 px-2 shadow-lg">
        <div className="mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-savannaGold to-serengetiGreen flex items-center justify-center shadow">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#E3B505" /><circle cx="12" cy="12" r="6" fill="#1A936F" /></svg>
          </div>
        </div>
        <nav className="flex flex-col gap-6 w-full items-center md:items-start">
          <button className="text-savannaGold font-bold">Feed</button>
          <button className="hover:text-savannaGold">My NFTs</button>
          <button className="hover:text-savannaGold">Profile</button>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1 text-savannaGold">Discover, Mint, and Collect African Safari NFTs</h1>
            <p className="text-green-400">Explore trending wildlife moments and top creators.</p>
          </div>
          <div className="flex items-center gap-4">
            <input className="rounded-lg px-4 py-2 bg-gold-50 text-[#18122B] placeholder-gold-300 focus:outline-none focus:ring-2 focus:ring-savannaGold" placeholder="Search everything here..." />
            <button className="bg-savannaGold text-black font-bold px-4 py-2 rounded-lg shadow hover:bg-gold-300">Mint NFT</button>
          </div>
        </header>
        {/* Trending Artists */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-savannaGold">Trending Artists</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-savannaGold to-serengetiGreen mb-2 shadow"></div>
                <span className="text-xs">@Artist{i}</span>
              </div>
            ))}
          </div>
        </section>
        {/* NFT Grid */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-savannaGold">Top Safari NFTs</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-gold-50 rounded-2xl p-4 flex flex-col gap-2 shadow-lg border border-gold-100">
                <div className="aspect-square bg-green-100 rounded-xl mb-2 animate-pulse"></div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-savannaGold">Safari #{i}</span>
                  <button className="bg-serengetiGreen text-white px-2 py-1 rounded text-xs hover:bg-green-300">View</button>
                </div>
                <div className="text-xs text-green-400">by @Artist{i}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
