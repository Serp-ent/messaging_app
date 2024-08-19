import { useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useEffect, useState } from "react";

export default function Profile() {
  const { id: paramId } = useParams();
  const { user, loading: loadingUserAuth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEdit] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [formData, setFormData] = useState(null);

  // TODO: handle error page for e.g. /profile/abc

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  useEffect(() => {
    if (!loadingUserAuth) {
      const finalId = paramId ? paramId : user.id;
      setProfileId(finalId);

      const fetchProfile = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/users/${finalId}`);
          if (!response.ok) throw new Error('Failed to fetch profile');
          const data = await response.json();
          setProfile(data.user);
          setFormData(data.user);
        } catch (error) {
          console.error('Error fetching profile:', error);
        }

      };

      fetchProfile();
    }
  }, [loadingUserAuth, paramId, user.id]);

  if (loadingUserAuth || !profile) {
    return <div>Loading...</div>;
  }

  const isOwnProfile = parseInt(profileId, 10) === user.id;

  const updateUser = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      return;
    }

    const result = await response.json();
    setProfile(result.user);
    setIsEdit(false);
  }


  return (
    <div>
      <h1>Profile</h1>
      {isOwnProfile && (
        <button onClick={() => setIsEdit((prev) => !prev)}>
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      )}
      {isEditing ? (
        <form onSubmit={updateUser}>
          <label>
            First Name:
            <input
              type="text"
              name="firstName"
              defaultValue={formData.firstName}
              onChange={handleChange}
            />
          </label>
          <label>
            Last Name:
            <input
              type="text"
              name="lastName"
              defaultValue={formData.lastName}
              onChange={handleChange}
            />
          </label>
          <button>Save</button>
        </form>
      ) : (
        <div>
          <p>First Name: {profile.firstName}</p>
          <p>Last Name: {profile.lastName}</p>
          <p>Email: {profile.email}</p>
        </div>
      )}
    </div>
  );
}