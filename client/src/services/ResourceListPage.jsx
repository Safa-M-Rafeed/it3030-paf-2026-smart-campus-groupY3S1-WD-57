import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Loader2 } from 'lucide-react';
import { resourceService } from '@/services/resourceService';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const ResourceListPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [typeFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters = typeFilter !== 'all' ? { type: typeFilter } : {};
      const data = await resourceService.getAll(filters);
      setResources(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = resources.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Facilities Catalogue</h1>
          <p className="text-slate-500">Manage SLIIT campus assets and halls.</p>
        </div>
        <Button asChild className="bg-blue-600">
          <Link to="/facilities/new"><Plus className="w-4 h-4 mr-2" /> Add New</Link>
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Search by name or location..." 
            className="pl-10" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select onValueChange={setTypeFilter} defaultValue="all">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Resource Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="LECTURE_HALL">Lecture Halls</SelectItem>
            <SelectItem value="LAB">Labs</SelectItem>
            <SelectItem value="MEETING_ROOM">Meeting Rooms</SelectItem>
            <SelectItem value="EQUIPMENT">Equipment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map(res => <ResourceCard key={res.id} resource={res} />)}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <p className="text-slate-400">No resources found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};