import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Calendar, Search, User, Hash, MapPin } from 'lucide-react';

type SearchType = 'all' | 'users' | 'hobbies' | 'events' | 'groups';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');

  const filters: { type: SearchType; label: string; icon: React.ElementType }[] = [
    { type: 'all', label: 'All', icon: Hash },
    { type: 'users', label: 'Users', icon: User },
    { type: 'hobbies', label: 'Hobbies', icon: Heart },
    { type: 'events', label: 'Events', icon: MapPin },
    { type: 'groups', label: 'Groups', icon: Users },
  ];

  return (
    <div className="space-y-12">
      <section className="text-center py-16 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-6">Where Hobbies Meet Kindness</h1>
        <div className="max-w-2xl mx-auto px-4 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for people, hobbies, events..."
              className="input pl-10 w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            {filters.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setSearchType(type)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
                  ${searchType === type 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'}`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Link to="/groups">
          <FeatureCard
            icon={<Users className="w-8 h-8 text-primary" />}
            title="Hobby Groups"
            description="Connect with like-minded individuals"
          />
        </Link>
        <Link to="/impact">
          <FeatureCard
            icon={<Heart className="w-8 h-8 text-primary" />}
            title="Track Impact"
            description="See your community contributions"
          />
        </Link>
        <Link to="/events">
          <FeatureCard
            icon={<Calendar className="w-8 h-8 text-primary" />}
            title="Community Events"
            description="Join local kindness activities"
          />
        </Link>
      </section>

      <section className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Recent Acts of Kindness</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/impact" className="transform hover:scale-105">
            <div className="card">
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3"
                alt="Community garden"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold mb-2">Community Garden Project</h3>
              <p className="text-gray-600">Started a neighborhood garden to share fresh produce</p>
            </div>
          </Link>
          <Link to="/impact" className="transform hover:scale-105">
            <div className="card">
              <img
                src="https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?ixlib=rb-4.0.3"
                alt="Knitting project"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold mb-2">Knitting for Shelters</h3>
              <p className="text-gray-600">Donated handmade scarves to local shelter</p>
            </div>
          </Link>
          <Link to="/impact" className="transform hover:scale-105">
            <div className="card">
              <img
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3"
                alt="Art class"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold mb-2">Free Art Classes</h3>
              <p className="text-gray-600">Teaching art to seniors at community center</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card text-center h-[200px] flex flex-col items-center justify-center p-6 transform hover:scale-105">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}