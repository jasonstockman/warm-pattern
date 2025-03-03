import React, { useState, useMemo } from 'react';
import { 
  useAssetSelector, 
  useLoadUserAssets,
  useAssetActions
} from '../store';
import { UserId, Asset, CreateAssetRequest, AssetId } from '../types';
import { Card, Button } from './ui';

interface Props {
  userId: UserId;
}

/**
 * AssetList component displays a list of assets for a user
 * with the ability to add and delete assets
 */
export const AssetList: React.FC<Props> = ({ userId }) => {
  const { loading, error } = useLoadUserAssets(userId);
  const assets = useAssetSelector(state => state.assets);
  const { addAsset, deleteAsset } = useAssetActions();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<CreateAssetRequest>>({
    description: '',
    value: 0,
    userId
  });
  
  // Use useMemo to convert assets record to array for rendering
  const assetArray = useMemo(() => {
    return Object.values(assets);
  }, [assets]);
  
  // Calculate total value of all assets - also memoize this calculation
  const totalValue = useMemo(() => {
    return assetArray.reduce((sum, asset) => sum + asset.value, 0);
  }, [assetArray]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAsset(prev => ({ 
      ...prev, 
      [name]: name === 'value' ? parseFloat(value) || 0 : value 
    }));
  };
  
  const handleAddAsset = async () => {
    if (!newAsset.description || newAsset.value === undefined) {
      return; // Don't submit if required fields are missing
    }
    
    try {
      await addAsset({
        description: newAsset.description,
        value: newAsset.value,
        userId
      } as CreateAssetRequest);
      
      // Reset form
      setNewAsset({
        description: '',
        value: 0,
        userId
      });
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add asset:', err);
    }
  };
  
  const handleDeleteAsset = async (assetId: AssetId) => {
    try {
      await deleteAsset(assetId);
    } catch (err) {
      console.error('Failed to delete asset:', err);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <div className="card-header">
          <h2>Assets</h2>
        </div>
        <div className="card-body">
          <p>Loading assets...</p>
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <div className="card-header">
          <h2>Assets</h2>
        </div>
        <div className="card-body">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card>
      <div className="card-header">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Assets</h2>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)} 
            variant="primary" 
            size="sm"
          >
            {showAddForm ? 'Cancel' : 'Add Asset'}
          </Button>
        </div>
      </div>
      <div className="card-body">
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <Card>
            <div className="card-header">
              <h3>Asset Summary</h3>
            </div>
            <div className="card-body">
              <p>Your total assets: <strong>${totalValue.toFixed(2)}</strong></p>
            </div>
          </Card>
          
          <Card>
            <div className="card-header">
              <h3>Add New Asset</h3>
            </div>
            <div className="card-body">
              <div className="grid gap-2">
                <div>
                  <label htmlFor="asset-name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="asset-name"
                    name="description"
                    value={newAsset.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Home, Car, Investment..."
                  />
                </div>
                <div>
                  <label htmlFor="asset-value" className="block text-sm font-medium text-gray-700">
                    Value ($)
                  </label>
                  <input
                    type="number"
                    id="asset-value"
                    name="value"
                    value={newAsset.value}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="25000"
                  />
                </div>
              </div>
              <Button 
                onClick={handleAddAsset} 
                variant="primary" 
                size="md"
                className="w-full"
              >
                Add Asset
              </Button>
            </div>
          </Card>
        </div>

        <Card>
          <div className="card-header">
            <h3>Your Assets</h3>
          </div>
          <div className="asset-list">
            {assetArray.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No assets added yet.
                <Button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                  variant="link" 
                  size="sm"
                >
                  Add your first asset
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {assetArray.map(asset => (
                  <AssetItem 
                    key={asset.id}
                    asset={asset}
                    onDelete={() => handleDeleteAsset(asset.id as AssetId)}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </Card>
  );
};

interface AssetItemProps {
  asset: Asset;
  onDelete: () => void;
}

const AssetItem: React.FC<AssetItemProps> = ({ asset, onDelete }) => {
  return (
    <div className="p-4 border rounded shadow-sm hover:bg-gray-50">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{asset.description}</h3>
          <p className="text-sm text-gray-600">
            Added on {new Date(asset.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="font-semibold text-green-600">
            ${asset.value.toFixed(2)}
          </span>
          <button 
            onClick={onDelete}
            className="text-red-500 hover:text-red-700"
            aria-label="Delete asset"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}; 