
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PinterestLogo from '@/components/ui/PinterestLogo';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <PinterestLogo className="h-8 w-8 mr-2" />
            <span className="text-xl font-bold text-pinterest-dark">Pin Perfect Pulse</span>
          </div>
          <div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="mr-2"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-pinterest-red hover:bg-pinterest-darkred text-white"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Track Your Pinterest Performance</h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Get insights into your Pinterest account's performance, track engagement metrics, and optimize your content strategy with Pin Perfect Pulse.
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-pinterest-red hover:bg-pinterest-darkred text-white text-lg px-8 py-6"
            >
              Get Started
            </Button>
          </div>
        </section>

        <section className="bg-gray-50 py-20 px-6">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">Account Analytics</h3>
                <p>Track key metrics across all your Pinterest accounts in one unified dashboard.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">Audience Insights</h3>
                <p>Understand your audience demographics and interests to create more targeted content.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">Performance Metrics</h3>
                <p>Analyze your content performance with detailed metrics and visualization tools.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 py-8 px-6 border-t border-gray-200">
        <div className="container mx-auto text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Pin Perfect Pulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
