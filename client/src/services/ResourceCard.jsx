import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, FlaskConical, Users, Monitor, MapPin, Users2, Edit3 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const typeIcons = {
  LECTURE_HALL: <Building2 className="w-5 h-5" />,
  LAB: <FlaskConical className="w-5 h-5" />,
  MEETING_ROOM: <Users className="w-5 h-5" />,
  EQUIPMENT: <Monitor className="w-5 h-5" />,
};

export const ResourceCard = ({ resource }) => {
  const { id, name, type, capacity, location, status } = resource;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200">
      <CardHeader className="pb-3 bg-slate-50/50">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
            {typeIcons[type] || <Building2 />}
          </div>
          <Badge variant={status === 'ACTIVE' ? 'success' : 'destructive'}>
            {status}
          </Badge>
        </div>
        <div className="mt-3">
          <h3 className="text-lg font-bold text-slate-900">{name}</h3>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {location}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="py-4">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <Users2 className="w-4 h-4 text-blue-500" />
            <span className="font-medium">{capacity} Seats</span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            {type?.replace('_', ' ')}
          </span>
        </div>
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2 pt-0">
        <Button asChild variant="outline" size="sm" className="w-full text-blue-600">
          <Link to={`/facilities/${id}`}>Details</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="w-full">
          <Link to={`/facilities/${id}/edit`} className="flex items-center gap-1">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};