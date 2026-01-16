import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import warehouseService from '../../services/warehouseService';
import GovHeader from '../../components/GovHeader';
import { dummyComplaints, dummyStats } from '../../data/data';

// Toggle this to use dummy data (true) or API data (false)
const USE_DUMMY_DATA = true;

function WarehouseDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stats, setStats] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  
  // Role-based access control
  const [userRole, setUserRole] = useState('warehouse_manager'); // Can be: 'admin', 'warehouse_manager', 'viewer'
  const [openSections, setOpenSections] = useState({
    statistics: true,
    search: true,
    complaints: true,
    actions: true
  });

  // Define role permissions
  const rolePermissions = {
    admin: {
      canView: ['statistics', 'search', 'complaints', 'actions'],
      canEdit: true,
      canResolve: true,
      canExport: true,
      canDelete: true
    },
    warehouse_manager: {
      canView: ['statistics', 'search', 'complaints', 'actions'],
      canEdit: true,
      canResolve: true,
      canExport: true,
      canDelete: false
    },
    viewer: {
      canView: ['statistics', 'complaints'],
      canEdit: false,
      canResolve: false,
      canExport: false,
      canDelete: false
    }
  };

  // Get current user permissions
  const getCurrentPermissions = () => rolePermissions[userRole] || rolePermissions.viewer;

  // Fetch all complaints on component mount
  useEffect(() => {
    fetchWarehouseComplaints();
    fetchWarehouseStats();
  }, []);

  // Fetch warehouse complaints
  const fetchWarehouseComplaints = async () => {
    setLoading(true);
    const loadingToast = toast.loading('Loading complaints...');
    
    try {
      if (USE_DUMMY_DATA) {
        // Use dummy data for testing
        setTimeout(() => {
          setComplaints(dummyComplaints);
          setFilteredComplaints(dummyComplaints);
          toast.dismiss(loadingToast);
          toast.success('Complaints loaded successfully!', {
            description: `Total complaints: ${dummyComplaints.length}`,
          });
          setLoading(false);
        }, 800); // Simulate network delay
      } else {
        // Use real API
        const data = await warehouseService.getWarehouseComplaints();
        setComplaints(data.complaints || []);
        setFilteredComplaints(data.complaints || []);
        toast.dismiss(loadingToast);
        toast.success('Complaints loaded successfully!', {
          description: `Total complaints: ${data.complaints?.length || 0}`,
        });
        setLoading(false);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to load complaints', {
        description: error.message || 'Please try again later',
      });
      console.error('Error fetching complaints:', error);
      setLoading(false);
    }
  };

  // Fetch warehouse statistics
  const fetchWarehouseStats = async () => {
    try {
      if (USE_DUMMY_DATA) {
        // Use dummy stats
        setStats(dummyStats);
      } else {
        // Use real API
        const data = await warehouseService.getWarehouseStats();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Search complaint by ID
  const handleSearchComplaint = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) {
      toast.warning('Please enter a complaint ID');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Searching for complaint...');
    
    try {
      if (USE_DUMMY_DATA) {
        // Search in dummy data
        setTimeout(() => {
          const found = dummyComplaints.filter(c => 
            c.complaintId.toLowerCase().includes(searchId.toLowerCase())
          );
          if (found.length > 0) {
            setFilteredComplaints(found);
            toast.dismiss(loadingToast);
            toast.success('Complaint found!');
          } else {
            toast.dismiss(loadingToast);
            toast.error('Complaint not found', {
              description: 'The complaint ID does not exist',
            });
          }
          setLoading(false);
        }, 500);
      } else {
        // Use real API
        const data = await warehouseService.searchComplaint(searchId);
        setFilteredComplaints([data.complaint]);
        toast.dismiss(loadingToast);
        toast.success('Complaint found!');
        setLoading(false);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Complaint not found', {
        description: 'The complaint ID does not exist',
      });
      console.error('Error searching complaint:', error);
      setLoading(false);
    }
  };

  // Clear filters and show all
  const handleClearFilters = () => {
    setSearchId('');
    setSelectedDateFilter('');
    setSelectedCategory('');
    setFilteredComplaints(complaints);
    toast.info('Filters cleared');
  };

  // Update complaint status
  const handleUpdateStatus = async (complaintId, newStatus) => {
    const loadingToast = toast.loading('Updating status...');
    try {
      await warehouseService.updateComplaintStatus(complaintId, newStatus);
      toast.dismiss(loadingToast);
      toast.success('Status updated successfully!');
      fetchWarehouseComplaints();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to update status', {
        description: error.message,
      });
    }
  };

  // Resolve complaint
  const handleResolveComplaint = async (complaintId) => {
    const loadingToast = toast.loading('Resolving complaint...');
    try {
      await warehouseService.resolveComplaint(complaintId, 'Resolved');
      toast.dismiss(loadingToast);
      toast.success('Complaint resolved successfully!');
      fetchWarehouseComplaints();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to resolve complaint', {
        description: error.message,
      });
    }
  };

  // Export report
  const handleExportReport = async () => {
    const loadingToast = toast.loading('Generating report...');
    try {
      const reportBlob = await warehouseService.exportComplaintsReport();
      const url = window.URL.createObjectURL(reportBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `warehouse-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.dismiss(loadingToast);
      toast.success('Report exported successfully!');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to export report', {
        description: error.message,
      });
    }
  };

  // Toggle section visibility
  const toggleSection = (sectionName) => {
    const permissions = getCurrentPermissions();
    if (permissions.canView.includes(sectionName)) {
      setOpenSections(prev => ({
        ...prev,
        [sectionName]: !prev[sectionName]
      }));
    }
  };

  // Role badge component
  const RoleBadge = () => (
    <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <span className="text-xs sm:text-sm font-medium text-gray-600">
        Current Role: 
        <span className={`ml-2 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
          userRole === 'admin' ? 'bg-red-100 text-red-800' :
          userRole === 'warehouse_manager' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {userRole.replace('_', ' ').toUpperCase()}
        </span>
      </span>
      <select 
        value={userRole} 
        onChange={(e) => setUserRole(e.target.value)}
        className="w-full sm:w-auto px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="admin">Admin</option>
        <option value="warehouse_manager">Warehouse Manager</option>
        <option value="viewer">Viewer</option>
      </select>
    </div>
  );

  const permissions = getCurrentPermissions();

  return (
    <div className="w-full min-h-screen bg-gray-50">
        <GovHeader title="Warehouse Dashboard" subtitle="Manage incoming complaints" />
        
        <RoleBadge />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">

      {/* Statistics Section */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
       
              <div className="px-3 sm:px-6 py-4 sm:py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 sm:p-6 text-white">
                    <h3 className="text-xs sm:text-sm font-medium opacity-75">Total Complaints</h3>
                    <p className="text-2xl sm:text-3xl font-bold mt-2">{stats.totalComplaints || 0}</p>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 sm:p-6 text-white">
                    <h3 className="text-xs sm:text-sm font-medium opacity-75">Pending</h3>
                    <p className="text-2xl sm:text-3xl font-bold mt-2">{stats.pendingCount || 0}</p>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-4 sm:p-6 text-white">
                    <h3 className="text-xs sm:text-sm font-medium opacity-75">In Progress</h3>
                    <p className="text-2xl sm:text-3xl font-bold mt-2">{stats.inProgressCount || 0}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 sm:p-6 text-white">
                    <h3 className="text-xs sm:text-sm font-medium opacity-75">Resolved</h3>
                    <p className="text-2xl sm:text-3xl font-bold mt-2">{stats.resolvedCount || 0}</p>
                  </div>
                </div>
              </div>
     
          </div>
        </div>
      
      {/* Search and Filter Section */}
      {permissions.canView.includes('search') && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={() => toggleSection('search')}
              className="w-full px-3 sm:px-6 py-3 sm:py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors duration-150"
            >
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Search & Filters</h2>
              <svg
                className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform duration-200 ${
                  openSections.search ? 'transform rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {openSections.search && (
              <div className="px-3 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
                {/* Search Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Search Complaint</h3>
                  <form onSubmit={handleSearchComplaint} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Search by Complaint ID..."
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                    <button 
                      type="submit" 
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm sm:text-base"
                    >
                      Search
                    </button>
                  </form>
                </div>

                {/* Filters Section */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
                      <input
                        type="date"
                        value={selectedDateFilter}
                        onChange={(e) => setSelectedDateFilter(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      >
                        <option value="">All Categories</option>
                        <option value="physical-damage">Physical Damage</option>
                        <option value="quality-issue">Quality Issue</option>
                        <option value="adr-reaction">ADR Reaction</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2 sm:invisible">Actions</label>
                      <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2">
                        <button 
                          onClick={handleClearFilters} 
                          className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 text-sm sm:text-base"
                        >
                          Clear
                        </button>
                        {permissions.canExport && (
                          <button 
                            onClick={handleExportReport} 
                            className="flex-1 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 text-sm sm:text-base"
                          >
                            Export
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Complaints Table Section */}
      {permissions.canView.includes('complaints') && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={() => toggleSection('complaints')}
              className="w-full px-3 sm:px-6 py-3 sm:py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors duration-150"
            >
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Complaints List ({filteredComplaints.length})
              </h2>
              <svg
                className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform duration-200 ${
                  openSections.complaints ? 'transform rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {openSections.complaints && (
              <div className="px-3 sm:px-6 pb-4 sm:pb-6">
                {loading ? (
                  <div className="flex flex-col sm:flex-row justify-center items-center py-8 sm:py-12 space-y-3 sm:space-y-0 sm:space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
                    <span className="text-sm sm:text-base text-gray-600">Loading complaints...</span>
                  </div>
                ) : filteredComplaints.length > 0 ? (
                  <>
                    {/* Mobile Card View */}
                    <div className="block lg:hidden space-y-4">
                      {filteredComplaints.map((complaint) => (
                        <div key={complaint.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <button
                              onClick={() => setSelectedComplaint(complaint)}
                              className="font-semibold text-blue-600 hover:underline text-sm focus:outline-none"
                              title="View details"
                            >
                              {complaint.complaintId}
                            </button>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              complaint.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {complaint.status.replace('-', ' ')}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Item:</span>
                              <span className="text-gray-900 font-medium">{complaint.itemName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Facility:</span>
                              <span className="text-gray-900">{complaint.facility}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Batch:</span>
                              <span className="text-gray-900">{complaint.batchNo}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Quantity:</span>
                              <span className="text-gray-900">{complaint.damagedQty}/{complaint.totalQty}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Date:</span>
                              <span className="text-gray-900">{new Date(complaint.raisedDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Timeline:</span>
                              <span className="text-gray-900">{complaint.timeline}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => setSelectedComplaint(complaint)}
                              className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors duration-150"
                            >
                              View Details
                            </button>
                            {permissions.canResolve && complaint.status !== 'resolved' && (
                              <button
                                onClick={() => handleResolveComplaint(complaint.id)}
                                className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors duration-150"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint ID</th>
                            <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                            <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
                            <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch No.</th>
                            <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty (D/T)</th>
                            <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raised On</th>
                            <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                            <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredComplaints.map((complaint) => (
                            <tr key={complaint.id} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-xs xl:text-sm font-medium text-gray-900">
                                <button
                                  onClick={() => setSelectedComplaint(complaint)}
                                  className="text-blue-600 hover:underline focus:outline-none text-xs xl:text-sm font-medium"
                                  title="View details"
                                >
                                  {complaint.complaintId}
                                </button>
                              </td>
                              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-xs xl:text-sm text-gray-900">
                                <div className="max-w-xs truncate" title={complaint.itemName}>
                                  {complaint.itemName}
                                </div>
                              </td>
                              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-xs xl:text-sm text-gray-900">
                                <div className="max-w-xs truncate" title={complaint.facility}>
                                  {complaint.facility}
                                </div>
                              </td>
                              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-xs xl:text-sm text-gray-900">
                                {complaint.batchNo}
                              </td>
                              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-xs xl:text-sm text-gray-900">
                                {complaint.damagedQty}/{complaint.totalQty}
                              </td>
                              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-xs xl:text-sm text-gray-900">
                                {new Date(complaint.raisedDate).toLocaleDateString()}
                              </td>
                              <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  complaint.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                  complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {complaint.status.replace('-', ' ')}
                                </span>
                              </td>
                              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-xs xl:text-sm text-gray-900">
                                {complaint.timeline}
                              </td>
                              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-xs xl:text-sm font-medium">
                                <div className="flex flex-col xl:flex-row xl:space-x-2 space-y-1 xl:space-y-0">
                                  <button
                                    onClick={() => setSelectedComplaint(complaint)}
                                    className="text-blue-600 hover:text-blue-900 transition-colors duration-150 text-xs xl:text-sm"
                                  >
                                    View
                                  </button>
                                  {permissions.canResolve && complaint.status !== 'resolved' && (
                                    <button
                                      onClick={() => handleResolveComplaint(complaint.id)}
                                      className="text-green-600 hover:text-green-900 transition-colors duration-150 text-xs xl:text-sm"
                                    >
                                      Resolve
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No complaints found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-full overflow-y-auto mx-auto">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Complaint Details</h2>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Complaint ID</label>
                  <p className="text-sm sm:text-base text-gray-900 font-medium">{selectedComplaint.complaintId}</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Item Name</label>
                  <p className="text-sm sm:text-base text-gray-900">{selectedComplaint.itemName}</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Facility</label>
                  <p className="text-sm sm:text-base text-gray-900">{selectedComplaint.facility}</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Batch No</label>
                  <p className="text-sm sm:text-base text-gray-900">{selectedComplaint.batchNo}</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedComplaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedComplaint.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    selectedComplaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedComplaint.status.replace('-', ' ')}
                  </span>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Timeline</label>
                  <p className="text-sm sm:text-base text-gray-900">{selectedComplaint.timeline}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Description</label>
                <p className="text-sm sm:text-base text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedComplaint.description || 'No description provided'}
                </p>
              </div>
            </div>
            
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              {permissions.canResolve && selectedComplaint.status !== 'resolved' && (
                <button
                  onClick={() => {
                    handleResolveComplaint(selectedComplaint.id);
                    setSelectedComplaint(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-150"
                >
                  Resolve Complaint
                </button>
              )}
              <button
                onClick={() => setSelectedComplaint(null)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-150"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default WarehouseDashboard;
