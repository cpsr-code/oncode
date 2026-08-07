import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router'; 
import { logoutUser } from '../features/auth/authSlice';

const GlobalNavbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error("Logout failed: ", err);
    }
  };

  // Force the DaisyUI dropdown to close after clicking a link
  const closeDropdown = () => {
    const elem = document.activeElement;
    if (elem) {
      elem.blur();
    }
  };
      
  return (
    <div className="navbar bg-base-100 border-b border-base-content/10 px-4 sm:px-8 top-0 sticky z-50">
      <div className="flex-1">
        <Link to="/" className="text-2xl font-bold text-base-content tracking-wide">
          On<span className="text-primary">code</span>
        </Link>
      </div>
      
      <div className="flex-none">
        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-10 flex items-center justify-center">
                <span>{user.firstName?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
            </div>
            
            <ul tabIndex={0} className="mt-3 z-1 p-2 shadow-2xl menu menu-sm dropdown-content bg-base-100 border border-base-content/10 rounded-box w-52">
              <li className="px-4 py-2 border-b border-base-content/10 text-base-content/70 text-xs cursor-default">
                Signed in as <br/> <strong className="text-base-content text-sm">{user.firstName}</strong>
              </li>
              
              <li className="mt-2">
                <Link to="/profile" onClick={closeDropdown} className="hover:bg-base-200 hover:text-base-content">
                  View Profile
                </Link>
              </li>
              
              {/* Admin Dashboard Link - Conditionally Rendered */}
              {user.role === 'admin' && (
                <li>
                  <Link to="/admin" onClick={closeDropdown} className="text-primary hover:bg-primary/10 hover:text-primary font-medium">
                    Admin Dashboard
                  </Link>
                </li>
              )}

              <li>
                <button onClick={handleLogout} className="text-error hover:bg-error/10 hover:text-error mt-1">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <Link to="/login" className="btn btn-sm btn-primary text-primary-content border-none shadow-lg">
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
};

export default GlobalNavbar;