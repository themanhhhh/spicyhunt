/**
 * Role-based Authorization Middleware
 * Use after authMiddleware to check if user has required role(s)
 */

// Role hierarchy (higher index = more permissions)
const ROLE_HIERARCHY = {
    'CUSTOMER': 0,
    'STAFF': 1,
    'MANAGER': 2,
    'ADMIN': 3
};

/**
 * Check if user has one of the allowed roles
 * @param  {...string} allowedRoles - Roles that are allowed to access the route
 * @returns Middleware function
 * 
 * Usage:
 * router.get('/admin-only', authMiddleware, requireRole('ADMIN'), handler);
 * router.get('/staff-or-admin', authMiddleware, requireRole('STAFF', 'MANAGER', 'ADMIN'), handler);
 */
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.userRole) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const userRole = req.userRole;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: 'Access denied. Insufficient permissions.',
                requiredRoles: allowedRoles,
                yourRole: userRole
            });
        }

        next();
    };
};

/**
 * Check if user has at least the minimum role level (based on hierarchy)
 * @param {string} minRole - Minimum role required
 * @returns Middleware function
 * 
 * Usage:
 * router.get('/manager-and-above', authMiddleware, requireMinRole('MANAGER'), handler);
 * // This allows MANAGER and ADMIN
 */
export const requireMinRole = (minRole) => {
    return (req, res, next) => {
        if (!req.user || !req.userRole) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const userRole = req.userRole;
        const userLevel = ROLE_HIERARCHY[userRole] ?? -1;
        const minLevel = ROLE_HIERARCHY[minRole] ?? 999;

        if (userLevel < minLevel) {
            return res.status(403).json({
                message: 'Access denied. Insufficient permissions.',
                requiredMinRole: minRole,
                yourRole: userRole
            });
        }

        next();
    };
};

/**
 * Admin only middleware (convenience wrapper)
 */
export const adminOnly = requireRole('ADMIN');

/**
 * Manager or Admin middleware (convenience wrapper)
 */
export const managerOrAdmin = requireRole('MANAGER', 'ADMIN');

/**
 * Staff, Manager or Admin middleware (convenience wrapper)
 */
export const staffOrAbove = requireRole('STAFF', 'MANAGER', 'ADMIN');

/**
 * Check if user is the owner of a resource or has admin privileges
 * @param {Function} getResourceOwner - Async function that takes req and returns the owner's userId
 * @returns Middleware function
 */
export const requireOwnerOrAdmin = (getResourceOwner) => {
    return async (req, res, next) => {
        if (!req.user || !req.userRole) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Admin can access anything
        if (req.userRole === 'ADMIN') {
            return next();
        }

        try {
            const ownerId = await getResourceOwner(req);

            if (!ownerId) {
                return res.status(404).json({ message: 'Resource not found' });
            }

            if (ownerId.toString() === req.userId.toString()) {
                return next();
            }

            return res.status(403).json({
                message: 'Access denied. You can only access your own resources.',
                yourRole: req.userRole
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error checking resource ownership' });
        }
    };
};
