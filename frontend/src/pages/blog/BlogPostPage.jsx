import React from 'react';
import { Layout as DashboardLayout } from '../dashboard/Layout';
import BlogPost from '../../components/blog/BlogPost';

const BlogPostPage = () => {
  return (
    <DashboardLayout>
      <BlogPost />
    </DashboardLayout>
  );
};

export default BlogPostPage;