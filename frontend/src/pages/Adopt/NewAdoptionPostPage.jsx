import React from "react";
import CreatePost from "../../components/CreatePost";

const NewAdoptionPostPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-100 py-10">
      <div className="container mx-auto px-6">
        <CreatePost isAuthenticated={true} forceShowForm={true} />
      </div>
    </div>
  );
};

export default NewAdoptionPostPage;
