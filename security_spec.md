# Security Specification for Bong Tech Store

## 1. Data Invariants

- **User Accounts**:
  - A user profile document ID must match the authenticated `request.auth.uid`.
  - Roles must be restricted: a normal user cannot register as `admin` or `staff`. Only the bootstrapped super admin (`sambathhok.true@gmail.com`) is granted immediate admin status, while others default to `customer`.
  - Users are forbidden from modifying their own roles.
  
- **Orders**:
  - An order can be created by any logged-in user.
  - The `status` of a new order must be `pending`.
  - Only the order's owner (the customer who placed it) can view/retrieve their own single order.
  - Admin/staff can list all orders, get any order, and update the order `status` (moving it to `confirmed` or `cancelled`).
  - Terminal State: Once an order is confirmed or cancelled, its status cannot be changed further except by an admin.
  - Customers cannot update their placed orders (immutable except for admin/staff updating the status).

---

## 2. The "Dirty Dozen" Payloads (Aesthetic Violations & Security Exploits)

1. **Self-Promoting Admin Profile**: A customer attempts to register their profile with a self-assigned `"role": "admin"`.
2. **Profile Hijacking**: User A tries to create/update a user profile at `users/UserB` with their own email.
3. **Ghost Role Modification**: A logged-in customer attempts to update their own profile and add `"role": "admin"`.
4. **Order Ownership Spoofing**: User A places an order but sets `"customerId": "UserB"` in the payload to make User B pay or trigger fake deliveries.
5. **Direct Status Manipulation**: A customer attempts to create a new order and pre-set its `"status": "confirmed"` to bypass payment or dispatch processes.
6. **Malicious Order Update**: A customer attempts to modify a pending order's price from `"$30.00"` to `"$0.01"`.
7. **Bypassing Terminal Order Status**: A staff member attempts to change a `cancelled` order back to `pending`.
8. **Junk Schema Injection**: An attacker attempts to create an order with non-existent keys (garbage fields) to exhaust firestore document size limits.
9. **Fake Time Registration**: A customer submits their order with a client-side timestamp `"createdAt": "2020-01-01T00:00:00Z"` instead of using the server-provided `request.time`.
10. **Denial of Wallet ID Flood**: An attacker attempts to use a 1MB string of junk characters as an `orderId` document ID.
11. **Impersonating Staff**: An attacker queries all orders without being authenticated as staff or admin.
12. **Blanket Read Harvesting**: An authenticated customer attempts to do a blanket list query at `orders` without specifying their personal `customerId` in the query's where clause.

---

## 3. Test Runner Design

We must design firestore rules that return `PERMISSION_DENIED` for all the above malicious payloads. The actual rules schema will enforce strict typechecking, relational checks, and role checks.
