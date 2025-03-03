import React, { useState } from 'react';
import { useUser } from '../../contexts';
import { assetService } from '../../api/services';
import { Asset, CreateAssetRequest } from '../../types/asset';

// Extended type for the form state to include an optional id
interface AssetFormState extends Partial<CreateAssetRequest> {
  id?: number;
}

const AssetsList: React.FC = () => {
  const { 
    assets, 
    refreshAssets, 
    isLoadingAssets, 
    errors, 
    userData 
  } = useUser();
  
  // State for the asset form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formAsset, setFormAsset] = useState<AssetFormState>({
    description: '',
    value: 0
  });
  const [formLoading, setFormLoading] = useState(false);
  
  // Format currency values
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Format date values
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'value') {
      // Convert to number and handle invalid input
      const numValue = parseFloat(value);
      setFormAsset(prev => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue
      }));
    } else {
      setFormAsset(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Validate form
    if (!formAsset.description) {
      setFormError('Description is required');
      return;
    }
    
    if (!formAsset.value || formAsset.value <= 0) {
      setFormError('Value must be greater than zero');
      return;
    }
    
    try {
      setFormLoading(true);
      
      // Create a new asset
      const userId = userData?.id;
      if (!userId) {
        setFormError('User ID is required');
        return;
      }
      
      const assetData: CreateAssetRequest = {
        userId,
        description: formAsset.description,
        value: formAsset.value
      };
      
      await assetService.create(assetData);
      
      // Reset form and refresh assets
      setFormAsset({
        description: '',
        value: 0
      });
      setIsFormOpen(false);
      await refreshAssets();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create asset');
    } finally {
      setFormLoading(false);
    }
  };
  
  // Handle delete asset
  const handleDeleteAsset = async (assetId: number) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) {
      return;
    }
    
    try {
      await assetService.delete(assetId);
      await refreshAssets();
    } catch (err: any) {
      console.error('Failed to delete asset:', err);
      // We don't show an error message here as it's a secondary action
    }
  };
  
  // Show loading state
  if (isLoadingAssets) {
    return (
      <div className="assets-loading">
        <p>Loading your assets...</p>
      </div>
    );
  }
  
  // Show error state
  if (errors.assets) {
    return (
      <div className="assets-error">
        <h2>Assets</h2>
        <div className="error-message">{errors.assets}</div>
      </div>
    );
  }
  
  // Calculate total value
  const totalValue = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  
  return (
    <div className="assets-list">
      <div className="assets-header">
        <h2>Your Assets</h2>
        <div className="assets-actions">
          <button 
            className="add-asset-button"
            onClick={() => setIsFormOpen(true)}
          >
            Add Asset
          </button>
        </div>
      </div>
      
      {isFormOpen && (
        <div className="asset-form-container">
          <h3>{formAsset.id ? 'Edit Asset' : 'Add New Asset'}</h3>
          
          <form onSubmit={handleFormSubmit} className="asset-form">
            {formError && (
              <div className="form-error">{formError}</div>
            )}
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formAsset.description}
                onChange={handleInputChange}
                placeholder="House, Car, etc."
                disabled={formLoading}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="value">Value</label>
              <input
                type="number"
                id="value"
                name="value"
                value={formAsset.value}
                onChange={handleInputChange}
                placeholder="25000"
                disabled={formLoading}
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setIsFormOpen(false);
                  setFormAsset({
                    description: '',
                    value: 0
                  });
                  setFormError(null);
                }}
                disabled={formLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={formLoading}
              >
                {formLoading ? 'Saving...' : 'Save Asset'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {assets.length === 0 ? (
        <div className="assets-empty">
          <p>You haven't added any assets yet.</p>
          <button 
            className="add-asset-button"
            onClick={() => setIsFormOpen(true)}
          >
            Add Your First Asset
          </button>
        </div>
      ) : (
        <>
          <div className="assets-total">
            <h3>Total Value</h3>
            <div className="total-value">{formatCurrency(totalValue)}</div>
          </div>
          
          <div className="assets-grid">
            {assets.map(asset => (
              <div key={asset.id} className="asset-card">
                <div className="asset-info">
                  <h3 className="asset-description">{asset.description}</h3>
                  <div className="asset-value">{formatCurrency(asset.value)}</div>
                  <div className="asset-date">
                    <small>Added: {formatDate(asset.created_at)}</small>
                  </div>
                </div>
                
                <div className="asset-actions">
                  <button
                    className="delete-asset-button"
                    onClick={() => handleDeleteAsset(asset.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AssetsList; 