import { useEffect } from 'react';

const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | ViewFlow` : 'ViewFlow';
  }, [title]);
};

export default useDocumentTitle;
