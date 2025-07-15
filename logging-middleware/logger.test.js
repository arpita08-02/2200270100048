// frontend/src/components/UserProfile.js
import { Log } from "../../logging-middleware/Logger";

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch user");
        
        const data = await response.json();
        setUser(data);
        
        // Log successful fetch
        Log("frontend", "info", "UserProfile", `Fetched user ${userId}`);
      } catch (err) {
        setError(err.message);
        
        // Log error
        Log("frontend", "error", "UserProfile", `Failed to fetch user: ${err.message}`);
      }
    };

    fetchUser();
  }, [userId]);

  return (
    <div>
      {error ? <p>Error: {error}</p> : <p>User: {user?.name}</p>}
    </div>
  );
};

export default UserProfile;