import { useState } from 'react';

interface NFT {
  id: string;
  imageUrl: string;
  location: {
    latitude: number;
    longitude: number;
  };
  owner: string;
  timestamp: Date;
  likes: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
}

interface NFTGridProps {
  nfts: NFT[];
  currentUserAddress?: string;
  onLike: (nftId: string) => void;
  onComment: (nftId: string, comment: string) => void;
}

export const NFTGrid = ({ nfts, currentUserAddress, onLike, onComment }: NFTGridProps) => {
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [newComment, setNewComment] = useState('');

  const handleCommentSubmit = (nftId: string) => {
    if (!newComment.trim()) return;
    onComment(nftId, newComment);
    setNewComment('');
  };

  return (
    <div className="container mx-auto px-4">
      {/* Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {nfts.map((nft) => (
          <div 
            key={nft.id}
            className="relative bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
            onClick={() => setSelectedNFT(nft)}
          >
            <img 
              src={`https://ipfs.io/ipfs/${nft.imageUrl}`}
              alt="Safari NFT"
              className="w-full aspect-square object-cover"
            />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {new Date(nft.timestamp).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLike(nft.id);
                    }}
                    className={`text-xl ${nft.likes > 0 ? 'text-savannaGold' : 'text-gray-400'}`}
                  >
                    ♥
                  </button>
                  <span className="text-sm text-gray-600">{nft.likes}</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                📍 {nft.location.latitude.toFixed(2)}°, {nft.location.longitude.toFixed(2)}°
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NFT Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end p-4">
              <button 
                onClick={() => setSelectedNFT(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="px-6 pb-6">
              <img 
                src={`https://ipfs.io/ipfs/${selectedNFT.imageUrl}`}
                alt="Safari NFT"
                className="w-full rounded-lg"
              />
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    By {selectedNFT.owner}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onLike(selectedNFT.id)}
                      className={`text-xl ${selectedNFT.likes > 0 ? 'text-savannaGold' : 'text-gray-400'}`}
                    >
                      ♥
                    </button>
                    <span className="text-sm text-gray-600">{selectedNFT.likes}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Comments</h3>
                  <div className="space-y-2">
                    {selectedNFT.comments.map((comment) => (
                      <div key={comment.id} className="text-sm">
                        <span className="font-medium">{comment.author}: </span>
                        {comment.text}
                      </div>
                    ))}
                  </div>
                  {currentUserAddress && (
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 border rounded px-3 py-1"
                      />
                      <button
                        onClick={() => handleCommentSubmit(selectedNFT.id)}
                        className="bg-savannaGold text-white px-4 py-1 rounded hover:bg-opacity-90"
                      >
                        Post
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
