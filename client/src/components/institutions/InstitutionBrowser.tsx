import React, { useEffect, useState } from 'react';
import { Card, Button } from '../../components/ui';
import { getInstitutions } from '../../services/api';
import { useLinkActions } from '../../store';
import { useAuth } from '../../../contexts/AuthContext';
import { createId } from '../../types/branded';
import LaunchLink from '../LaunchLink';
import { getNumericUserId } from '../../utils/userUtils';

interface Institution {
  institution_id: string;
  name: string;
  products: string[];
  country_codes: string[];
  logo: string;
  oauth: boolean;
}

const InstitutionBrowser: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);

  const pageSize = 12;
  const { user } = useAuth();
  const userId = getNumericUserId(user);
  const { generateLinkToken } = useLinkActions();
  
  useEffect(() => {
    const fetchInstitutions = async () => {
      setLoading(true);
      try {
        const response = await getInstitutions();
        if (response.status === 200) {
          setInstitutions(response.data);
          setFilteredInstitutions(response.data);
          setError(null);
        } else {
          setError(response.data.error || 'Failed to fetch institutions');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, []);

  useEffect(() => {
    let result = institutions;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        inst => inst.name.toLowerCase().includes(term)
      );
    }
    
    // Filter by product
    if (productFilter !== 'all') {
      result = result.filter(
        inst => inst.products.includes(productFilter)
      );
    }
    
    // Filter by country
    if (countryFilter !== 'all') {
      result = result.filter(
        inst => inst.country_codes.includes(countryFilter)
      );
    }
    
    setFilteredInstitutions(result);
    setCurrentPage(1);
  }, [searchTerm, productFilter, countryFilter, institutions]);

  // Get unique products and countries for filters
  const uniqueProducts = Array.from(
    new Set(institutions.flatMap(inst => inst.products))
  ).sort();
  
  const uniqueCountries = Array.from(
    new Set(institutions.flatMap(inst => inst.country_codes))
  ).sort();

  // Calculate pagination
  const totalPages = Math.ceil(filteredInstitutions.length / pageSize);
  const paginatedInstitutions = filteredInstitutions
    .slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleLinkBank = async (institutionId: string) => {
    if (!userId) return;
    
    setSelectedInstitution(institutionId);
    try {
      await generateLinkToken(userId, null);
      // Get the link token from localStorage
      const oauthConfig = localStorage.getItem('oauthConfig');
      if (oauthConfig) {
        const { token } = JSON.parse(oauthConfig);
        setLinkToken(token);
      }
    } catch (error) {
      console.error('Error generating link token:', error);
    }
  };

  return (
    <div className="institution-browser">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Financial Institutions</h1>
        <p className="text-gray-600">
          Browse and connect to supported financial institutions
        </p>
      </div>

      <div className="filters mb-6">
        <Card>
          <div className="card-header">
            <h2 className="text-lg font-semibold">Search & Filter</h2>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <label htmlFor="search" className="mb-2 block font-medium">
                Search Institution
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name..."
                className="w-full rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="product-filter" className="mb-2 block font-medium">
                  Filter by Product
                </label>
                <select
                  id="product-filter"
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                >
                  <option value="all">All Products</option>
                  {uniqueProducts.map(product => (
                    <option key={product} value={product}>
                      {product.charAt(0).toUpperCase() + product.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="country-filter" className="mb-2 block font-medium">
                  Filter by Country
                </label>
                <select
                  id="country-filter"
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                >
                  <option value="all">All Countries</option>
                  {uniqueCountries.map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && filteredInstitutions.length === 0 && (
        <div className="py-8 text-center">
          <p className="mb-2 text-lg font-semibold">No Institutions Found</p>
          <p className="text-gray-600">Try adjusting your search or filters.</p>
        </div>
      )}

      {!loading && !error && filteredInstitutions.length > 0 && (
        <>
          <div className="institution-grid mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedInstitutions.map((institution) => (
              <Card key={institution.institution_id} className="institution-card">
                <div className="card-header flex items-center">
                  <div className="institution-logo mr-3 h-10 w-10 overflow-hidden rounded">
                    {institution.logo ? (
                      <img
                        src={institution.logo}
                        alt={institution.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200 text-lg font-bold text-gray-500">
                        {institution.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-medium">{institution.name}</h3>
                </div>
                
                <div className="card-body">
                  <div className="mb-3">
                    <p className="mb-1 text-sm font-medium text-gray-500">
                      Products
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {institution.products.map(product => (
                        <span
                          key={product}
                          className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                        >
                          {product}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="mb-1 text-sm font-medium text-gray-500">
                      Countries
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {institution.country_codes.map(country => (
                        <span
                          key={country}
                          className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800"
                        >
                          {country}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => handleLinkBank(institution.institution_id)}
                    >
                      Connect Bank
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination mb-6 flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, filteredInstitutions.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredInstitutions.length}</span> institutions
                </span>
              </div>
              <div className="flex">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={`mr-2 ${currentPage === 1 ? 'opacity-50' : ''}`}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={`${currentPage === totalPages ? 'opacity-50' : ''}`}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      
      {linkToken && userId && (
        <LaunchLink token={linkToken} userId={userId} itemId={null} />
      )}
    </div>
  );
};

export default InstitutionBrowser; 