import { useEffect } from 'react';

const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | ViewFlow` : 'ViewFlow - Premium Video Streaming';
  }, [title]);
};

export default useDocumentTitle;
