import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const baseTitle = 'Zealthy';
    
    let pageTitle = baseTitle;
    
    switch (location.pathname) {
      case '/':
        pageTitle = `${baseTitle} - Patient Portal`;
        break;
      case '/admin':
        pageTitle = `${baseTitle} - Mini EMR`;
        break;
      case '/black-friday':
        pageTitle = `${baseTitle} - Black Friday Sale`;
        break;
      default:
        pageTitle = `${baseTitle} - Patient Portal`;
    }
    
    document.title = pageTitle;
  }, [location.pathname]);
};
