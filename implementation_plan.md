# RBAC System: Superior Admin & Secondary Admin

Implement a Role-Based Access Control system distinguishing between a **Superior Admin** (`premvellogi@gmail.com`) and **Secondary Admins** who can manage events but not other admins.

## User Review Required

> [!IMPORTANT]
> The Superior Admin is **hardcoded** to the email `premvellogi@gmail.com`. This is intentional per the requirements — no database flag or environment variable is used to determine "superior" status. Only the email match controls it.

> [!WARNING]
> The existing `role` enum in the User model will change from `['student', 'admin']` → `['student', 'secondary_admin', 'superior_admin']`. Any existing users with `role: 'admin'` in the database will need to be manually updated to `'superior_admin'` or `'secondary_admin'`. I'll provide a migration note.

> [!IMPORTANT]
> The `adminOnly` middleware will be updated so that **both** `secondary_admin` and `superior_admin` can access event CRUD routes. The new `isSuperiorAdmin` middleware will additionally gate the admin-management routes.

---

## Proposed Changes

### Backend — User Model

#### [MODIFY] [User.js](file:///c:/uni%20info/backend/src/models/User.js)
- Update `role` enum from `['student', 'admin']` → `['student', 'secondary_admin', 'superior_admin']`
- Default remains `'student'`

---

### Backend — Auth Middleware

#### [MODIFY] [auth.js](file:///c:/uni%20info/backend/src/middleware/auth.js)
- Update `adminOnly` to accept both `secondary_admin` and `superior_admin`
- Add new `isSuperiorAdmin` middleware that checks `req.user.email === 'premvellogi@gmail.com'` **and** `req.user.role === 'superior_admin'`

---

### Backend — Admin Controller (NEW)

#### [NEW] [admin.controller.js](file:///c:/uni%20info/backend/src/controllers/admin.controller.js)
- `getSecondaryAdmins` — Fetch all users with `role: 'secondary_admin'`
- `createSecondaryAdmin` — Create a user with `role: 'secondary_admin'`, password hashed via bcrypt (salt 10, handled by the existing pre-save hook in User model)
- `updateSecondaryAdmin` — Update name/email/password of a secondary admin
- `deleteSecondaryAdmin` — Delete a secondary admin by ID

---

### Backend — Admin Routes (NEW)

#### [NEW] [admin.routes.js](file:///c:/uni%20info/backend/src/routes/admin.routes.js)
- All routes protected by `protect` + `isSuperiorAdmin`
- `GET /api/admin/secondary-admins` → list
- `POST /api/admin/secondary-admins` → create
- `PUT /api/admin/secondary-admins/:id` → update
- `DELETE /api/admin/secondary-admins/:id` → delete

---

### Backend — Server Entry

#### [MODIFY] [server.js](file:///c:/uni%20info/backend/server.js)
- Mount the new admin routes: `app.use('/api/admin', adminRoutes)`

---

### Backend — Auth Controller

#### [MODIFY] [auth.controller.js](file:///c:/uni%20info/backend/src/controllers/auth.controller.js)
- Update the `login` function to auto-assign `superior_admin` role if logging in as `premvellogi@gmail.com` (in case the DB record has an old role)
- The `register` route remains student-only (secondary admins are created by the superior admin, not via self-registration)

---

### Frontend — TypeScript Types

#### [MODIFY] [index.ts](file:///c:/uni%20info/frontend/types/index.ts)
- Update `User.role` from `'student' | 'admin'` → `'student' | 'secondary_admin' | 'superior_admin'`

---

### Frontend — Auth Context

#### [MODIFY] [AuthContext.tsx](file:///c:/uni%20info/frontend/context/AuthContext.tsx)
- Update `isAdmin` to check for `role === 'secondary_admin' || role === 'superior_admin'`
- Add `isSuperiorAdmin` boolean: `user?.email === 'premvellogi@gmail.com'`
- Export `isSuperiorAdmin` in the context value

---

### Frontend — Navbar

#### [MODIFY] [Navbar.tsx](file:///c:/uni%20info/frontend/components/Navbar.tsx)
- The existing `isAdmin` check for showing "Admin Dashboard" already works since we're updating the `isAdmin` logic in context

---

### Frontend — Admin Dashboard

#### [MODIFY] [page.tsx](file:///c:/uni%20info/frontend/app/admin/page.tsx)
- Add a new `'admins'` tab to the nav (conditionally shown only when `user?.email === 'premvellogi@gmail.com'`)
- Build the **Manage Admins** tab UI:
  - A form to create/edit secondary admins (Name, Gmail, Password fields)
  - A table listing all secondary admins with Edit and Delete buttons
  - Full CRUD wired to the new `/api/admin/secondary-admins` endpoints

---

## Permissions Summary

| Action | Student | Secondary Admin | Superior Admin |
|---|---|---|---|
| View Events | ✅ | ✅ | ✅ |
| Create/Edit/Delete Events | ❌ | ✅ | ✅ |
| Broadcast Notifications | ❌ | ✅ | ✅ |
| Create/Edit/Delete Secondary Admins | ❌ | ❌ | ✅ |

---

## Verification Plan

### Automated Tests
1. Start backend server, confirm no startup errors
2. Start frontend, confirm no build errors
3. Login as `premvellogi@gmail.com` → confirm `superior_admin` role in response → confirm "Manage Admins" tab visible
4. Create a secondary admin via the UI → confirm it appears in the table
5. Login as the newly created secondary admin → confirm "Admin Dashboard" is accessible but "Manage Admins" tab is **not** visible
6. Attempt to hit `/api/admin/secondary-admins` as a secondary admin → confirm 403 Forbidden

### Manual Verification
- Browser testing of the full admin management flow
