
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  User, 
  Users, 
  PieChart, 
  Menu, 
  X, 
  Plus, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PinterestLogo from '../ui/PinterestLogo';
import AddAccountModal from '../accounts/AddAccountModal';

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountsExpanded, setIsAccountsExpanded] = useState(true);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleAddAccountSuccess = () => {
    setIsAddAccountModalOpen(false);
  };

  const navItems = [
    {
      title: "Accounts",
      path: "/",
      icon: <Users className="w-5 h-5" />,
      isExpandable: true,
      isExpanded: isAccountsExpanded,
      onClick: () => setIsAccountsExpanded(!isAccountsExpanded),
    },
    {
      title: "General Analytics",
      path: "/analytics",
      icon: <PieChart className="w-5 h-5" />,
    }
  ];

  return (
    <>
      {/* Mobile menu button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleMobileMenu} 
        className="fixed top-4 left-4 z-50 lg:hidden"
      >
        {isMobileMenuOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static",
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-center h-16 px-6 border-b">
            <Link to="/" className="flex items-center space-x-2">
              <PinterestLogo className="w-8 h-8" />
              <span className="text-xl font-semibold text-pinterest-dark">Analytics</span>
            </Link>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 px-3 py-4 overflow-y-auto">
            <Button
              variant="outline"
              className="w-full mb-4 flex items-center justify-center gap-2 bg-pinterest-red text-white hover:bg-pinterest-darkred"
              onClick={() => setIsAddAccountModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Add account</span>
            </Button>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <div key={item.path} className="mb-1">
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md hover:bg-pinterest-gray transition-colors",
                      isActive(item.path) ? "bg-pinterest-gray font-medium" : ""
                    )}
                    onClick={item.isExpandable ? item.onClick : undefined}
                  >
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-6 h-6 mr-3">
                        {item.icon}
                      </span>
                      <span>{item.title}</span>
                    </div>
                    {item.isExpandable && (
                      <span>
                        {item.isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </Link>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Add Account Modal */}
      <AddAccountModal 
        open={isAddAccountModalOpen} 
        onClose={() => setIsAddAccountModalOpen(false)}
        onSuccess={handleAddAccountSuccess}
      />
    </>
  );
};

export default Sidebar;
