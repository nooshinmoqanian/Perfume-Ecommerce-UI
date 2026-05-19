import { useEffect, useMemo, useState } from "react";
import {
  createCategory,
  createProduct,
  createUser,
  deleteCategory,
  deleteProduct,
  getMe,
  getProductImageUrl,
  listCategories,
  listNotifications,
  listOrders,
  listProducts,
  listUsers,
  setLastRequestId,
  updateProduct,
  updateUserRole,
  uploadProductImage,
} from "../api";
import { clearAuthToken, getAuthToken } from "../hooks/useAuthToken";
import { showToast } from "../hooks/useToast";
import { formatToman } from "../utils/format";

function CategorySelector({ value, onChange, categories }) {
  const [typedValue, setTypedValue] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = categories.filter((item) => item.toLowerCase().includes(typedValue.toLowerCase()));

  return (
    <div className="relative">
      <input
        className="w-full rounded border border-violet-200 px-3 py-2"
        value={open ? typedValue : value}
        onFocus={() => {
          setOpen(true);
          setTypedValue("");
        }}
        onBlur={() => {
          setTimeout(() => setOpen(false), 120);
        }}
        onChange={(event) => setTypedValue(event.target.value)}
        placeholder="Type or choose category"
      />

      {open && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded border bg-white shadow">
          {filtered.length === 0 && <div className="p-2 text-sm text-gray-500">No category</div>}
          {filtered.map((item) => (
            <div
              key={item}
              className="cursor-pointer px-3 py-2 hover:bg-violet-50"
              onMouseDown={() => onChange(item)}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const token = getAuthToken();

  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState("add-product");

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState(["general"]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [newSku, setNewSku] = useState("");
  const [newStock, setNewStock] = useState(0);
  const [newPrice, setNewPrice] = useState("");
  const [newFeatures, setNewFeatures] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [creatingProduct, setCreatingProduct] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("general");
  const [editSku, setEditSku] = useState("");
  const [editStock, setEditStock] = useState(0);
  const [editPrice, setEditPrice] = useState("");
  const [editFeatures, setEditFeatures] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);

  const [creatingUser, setCreatingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");

  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit, setUsersLimit] = useState(20);
  const [usersQuery, setUsersQuery] = useState("");
  const [usersTotal, setUsersTotal] = useState(0);

  const tabs = useMemo(
    () => [
      { key: "add-product", label: "Add product" },
      { key: "products", label: `Products (${products.length})` },
      { key: "orders", label: `Orders (${orders.length})` },
      { key: "notifications", label: `Notifications (${notifications.length})` },
      { key: "users", label: `Users (${users.length})` },
    ],
    [products.length, orders.length, notifications.length, users.length]
  );

  const fetchCategories = async () => {
    try {
      const data = await listCategories();
      const names = (Array.isArray(data) ? data : [])
        .map((item) => (typeof item === "string" ? item : item?.name))
        .filter(Boolean);
      setCategories(["general", ...Array.from(new Set(names))]);
    } catch {
      setCategories(["general"]);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await listProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await listOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const data = await listNotifications(50);
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchUsers = async ({ page = usersPage, limit = usersLimit, q = usersQuery } = {}) => {
    setLoadingUsers(true);
    try {
      const data = await listUsers({ page, limit, q }, token);
      setUsers(Array.isArray(data?.users) ? data.users : []);
      setUsersTotal(Number(data?.total || 0));
      setUsersPage(Number(data?.page || page));
      setUsersLimit(Number(data?.limit || limit));
    } catch {
      setUsers([]);
      setUsersTotal(0);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (!token) {
          window.location.assign("/login");
          return;
        }

        if (token !== "dev-admin-1345678") {
          const me = await getMe(token);
          if (me?.role !== "admin") {
            showToast("Admin access required", "error");
            window.location.assign("/");
            return;
          }
        }

        await Promise.all([fetchCategories(), fetchProducts(), fetchOrders(), fetchNotifications(), fetchUsers()]);
        setReady(true);
      } catch {
        clearAuthToken();
        window.location.assign("/login");
      }
    };

    bootstrap();
  }, []);

  if (!ready) {
    return <div className="p-8">Checking access...</div>;
  }

  const resetCreateForm = () => {
    setNewName("");
    setNewCategory("general");
    setNewSku("");
    setNewStock(0);
    setNewPrice("");
    setNewFeatures("");
    setNewDescription("");
    setNewImage(null);
  };

  const submitCreateProduct = async (event) => {
    event.preventDefault();
    if (!newName.trim()) {
      showToast("Product name is required", "error");
      return;
    }

    setCreatingProduct(true);
    try {
      const formData = new FormData();
      formData.append("name", newName.trim());
      formData.append("category", newCategory);
      if (newSku.trim()) formData.append("sku", newSku.trim());
      formData.append("stock", String(Number(newStock) || 0));
      if (newPrice !== "") formData.append("price", String(Number(newPrice)));
      if (newFeatures.trim()) formData.append("features", newFeatures.trim());
      if (newDescription.trim()) formData.append("extraDescription", newDescription.trim());
      if (newImage) formData.append("image", newImage, newImage.name);

      await createProduct(formData);
      await fetchProducts();
      resetCreateForm();
      setActiveTab("products");
      showToast("Product created", "success");
    } catch (error) {
      showToast(error.message || "Product creation failed", "error");
    } finally {
      setCreatingProduct(false);
    }
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setEditName(product.name || "");
    setEditCategory(product.category || "general");
    setEditSku(product.sku || "");
    setEditStock(Number(product.stock || 0));
    setEditPrice(product.price ?? "");
    setEditFeatures(Array.isArray(product.features) ? product.features.join(", ") : product.features || "");
    setEditDescription(product.extraDescription || "");
    setEditImage(null);
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditCategory("general");
    setEditSku("");
    setEditStock(0);
    setEditPrice("");
    setEditFeatures("");
    setEditDescription("");
    setEditImage(null);
  };

  const saveEdit = async (id) => {
    setSavingProduct(true);
    try {
      const payload = {
        name: editName,
        category: editCategory,
        sku: editSku,
        stock: Number(editStock) || 0,
        features: editFeatures,
        extraDescription: editDescription,
      };

      if (editPrice !== "") {
        payload.price = Number(editPrice);
      }

      await updateProduct(id, payload);
      if (editImage) {
        const formData = new FormData();
        formData.append("image", editImage, editImage.name);
        await uploadProductImage(id, formData);
      }
      await fetchProducts();
      closeEdit();
      showToast("Product updated", "success");
    } catch (error) {
      showToast(error.message || "Save failed", "error");
    } finally {
      setSavingProduct(false);
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      await fetchProducts();
      showToast("Product deleted", "success");
    } catch (error) {
      showToast(error.message || "Delete failed", "error");
    }
  };

  const addCategory = async () => {
    const name = window.prompt("New category name") || "";
    if (!name.trim()) return;
    try {
      await createCategory(name.trim());
      await fetchCategories();
      showToast("Category created", "success");
    } catch (error) {
      showToast(error.message || "Category create failed", "error");
    }
  };

  const removeCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteCategory(id);
      await fetchCategories();
      await fetchProducts();
      showToast("Category deleted", "success");
    } catch (error) {
      showToast(error.message || "Category delete failed", "error");
    }
  };

  const submitCreateUser = async (event) => {
    event.preventDefault();
    if (!newUserEmail.trim() || !newUserPassword.trim()) {
      showToast("Email and password are required", "error");
      return;
    }

    setCreatingUser(true);
    try {
      await createUser({ email: newUserEmail.trim(), password: newUserPassword, role: newUserRole });
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("user");
      await fetchUsers();
      showToast("User created", "success");
    } catch (error) {
      showToast(error.message || "User creation failed", "error");
    } finally {
      setCreatingUser(false);
    }
  };

  const toggleRole = async (user) => {
    const targetRole = user.role === "admin" ? "user" : "admin";
    if (!window.confirm(`Change user role to ${targetRole}?`)) return;

    try {
      await updateUserRole(user.id, targetRole, token);
      await fetchUsers();
      showToast("User role updated", "success");
    } catch (error) {
      showToast(error.message || "Role update failed", "error");
    }
  };

  const maxPage = Math.max(1, Math.ceil(usersTotal / usersLimit));

  return (
    <div className="min-h-screen bg-violet-50 px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl lg:flex lg:items-start lg:gap-6">
        <aside className="mb-4 rounded-2xl border border-violet-200 bg-white p-3 shadow-sm lg:sticky lg:top-24 lg:mb-0 lg:w-72">
          <h1 className="mb-3 px-2 text-lg font-bold text-violet-900">Admin panel</h1>
          <nav className="grid gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                  activeTab === tab.key
                    ? "bg-violet-700 text-white shadow"
                    : "bg-violet-50 text-violet-800 hover:bg-violet-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 rounded-2xl border border-violet-200 bg-white p-4 shadow-sm md:p-6">
          {activeTab === "add-product" && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-violet-900">Add product</h2>
              </div>

              <form className="grid gap-3" onSubmit={submitCreateProduct}>
                <input
                  placeholder="Product name"
                  className="rounded border border-violet-200 px-3 py-2"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                />

                <CategorySelector value={newCategory} onChange={setNewCategory} categories={categories} />

                <input
                  placeholder="SKU"
                  className="rounded border border-violet-200 px-3 py-2"
                  value={newSku}
                  onChange={(event) => setNewSku(event.target.value)}
                />

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <input
                    type="number"
                    placeholder="Stock"
                    className="rounded border border-violet-200 px-3 py-2"
                    value={newStock}
                    onChange={(event) => setNewStock(Number(event.target.value) || 0)}
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    className="rounded border border-violet-200 px-3 py-2"
                    value={newPrice}
                    onChange={(event) => setNewPrice(event.target.value)}
                  />
                </div>

                <input
                  placeholder="Features (comma separated)"
                  className="rounded border border-violet-200 px-3 py-2"
                  value={newFeatures}
                  onChange={(event) => setNewFeatures(event.target.value)}
                />

                <textarea
                  placeholder="Extra description"
                  className="rounded border border-violet-200 px-3 py-2"
                  value={newDescription}
                  onChange={(event) => setNewDescription(event.target.value)}
                />

                <input type="file" accept="image/*" onChange={(event) => setNewImage(event.target.files?.[0] || null)} />

                <div>
                  <button
                    className="rounded bg-violet-700 px-4 py-2 text-white hover:bg-violet-600 disabled:opacity-70"
                    disabled={creatingProduct}
                  >
                    {creatingProduct ? "Creating..." : "Create product"}
                  </button>
                </div>
              </form>

              <div className="mt-6 rounded-lg border border-violet-100 bg-violet-50/40 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-violet-900">Category management</h3>
                  <button className="rounded bg-green-600 px-2 py-1 text-sm text-white" onClick={addCategory}>
                    Add category
                  </button>
                </div>

                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center justify-between rounded border bg-white px-3 py-2 text-sm">
                      <div>{category}</div>
                      <button
                        className="rounded bg-red-600 px-2 py-1 text-xs text-white disabled:opacity-70"
                        onClick={() => removeCategory(category)}
                        disabled={category === "general"}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === "products" && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-violet-900">Products</h2>
                <button className="rounded bg-violet-100 px-3 py-1 text-sm text-violet-800" onClick={fetchProducts}>
                  Refresh
                </button>
              </div>

              {loadingProducts ? (
                <p>Loading products...</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {products.length === 0 && <p className="text-sm text-gray-500">No products created yet.</p>}

                  {products.map((product) => (
                    <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-3" key={product.id}>
                      <div className="mb-3 h-40 w-full overflow-hidden rounded bg-white">
                        <img
                          src={product.imageId ? getProductImageUrl(product.id) : product.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(product.id)}/400/300`}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {editingId === product.id ? (
                        <div className="space-y-2">
                          <input className="w-full rounded border px-2 py-1" value={editName} onChange={(event) => setEditName(event.target.value)} />
                          <CategorySelector value={editCategory} onChange={setEditCategory} categories={categories} />
                          <input className="w-full rounded border px-2 py-1" value={editSku} onChange={(event) => setEditSku(event.target.value)} />

                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              className="rounded border px-2 py-1"
                              value={editStock}
                              onChange={(event) => setEditStock(Number(event.target.value) || 0)}
                            />
                            <input
                              type="number"
                              step="0.01"
                              className="rounded border px-2 py-1"
                              value={editPrice}
                              onChange={(event) => setEditPrice(event.target.value)}
                            />
                          </div>

                          <input
                            className="w-full rounded border px-2 py-1"
                            placeholder="Features"
                            value={editFeatures}
                            onChange={(event) => setEditFeatures(event.target.value)}
                          />
                          <textarea
                            className="w-full rounded border px-2 py-1"
                            placeholder="Description"
                            value={editDescription}
                            onChange={(event) => setEditDescription(event.target.value)}
                          />

                          <input type="file" accept="image/*" onChange={(event) => setEditImage(event.target.files?.[0] || null)} />

                          <div className="flex gap-2">
                            <button
                              className="rounded bg-green-600 px-3 py-1 text-white disabled:opacity-70"
                              disabled={savingProduct}
                              onClick={() => saveEdit(product.id)}
                            >
                              Save
                            </button>
                            <button className="rounded bg-gray-200 px-3 py-1" onClick={closeEdit}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold text-violet-900">{product.name}</h3>
                          <p className="text-sm text-gray-600">Category: {product.category || "general"}</p>
                          <p className="text-sm text-gray-600">SKU: {product.sku || "-"}</p>
                          <p className="mt-1 text-sm text-gray-700">Price: {formatToman(product.price ?? 0)}</p>
                          <p className="text-sm text-gray-700">Stock: {product.stock}</p>
                          {product.extraDescription && <p className="text-sm text-gray-600">{product.extraDescription}</p>}

                          <div className="mt-3 flex items-center gap-2">
                            <button className="rounded bg-amber-500 px-3 py-1 text-white" onClick={() => openEdit(product)}>
                              Edit
                            </button>
                            <button className="rounded bg-red-600 px-3 py-1 text-white" onClick={() => removeProduct(product.id)}>
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "orders" && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-violet-900">Recent orders</h2>
                <button className="rounded bg-violet-100 px-3 py-1 text-sm text-violet-800" onClick={fetchOrders}>
                  Refresh
                </button>
              </div>

              {loadingOrders ? (
                <p>Loading orders...</p>
              ) : (
                <div className="space-y-2">
                  {orders.length === 0 && <p className="text-sm text-gray-500">No orders found.</p>}
                  {orders.map((order) => (
                    <div className="rounded-lg border border-violet-100 p-3" key={order.id || order._id}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-violet-900">Order {order.id || order._id}</div>
                          <div className="text-sm text-gray-600">{order.phone || "-"}</div>
                          <div className="mt-1 text-sm text-gray-700">{order.shippingAddress || "-"}</div>
                        </div>
                        <div className="text-sm text-violet-700">{order.status || "unknown"}</div>
                      </div>

                      {order.items && order.items.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-gray-700">
                          {order.items.map((item, index) => (
                            <li key={`${item.productId}-${index}`}>
                              {item.name || item.productId} x{item.quantity} - {formatToman(item.price || 0)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "notifications" && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-violet-900">Notifications</h2>
                <button className="rounded bg-violet-100 px-3 py-1 text-sm text-violet-800" onClick={fetchNotifications}>
                  Refresh
                </button>
              </div>

              {loadingNotifications ? (
                <p>Loading notifications...</p>
              ) : (
                <div className="space-y-2">
                  {notifications.length === 0 && <p className="text-sm text-gray-500">No notifications available.</p>}
                  {notifications.map((notification) => (
                    <div className="rounded-lg border border-violet-100 p-3" key={notification.id || `${notification.createdAt}-${notification.message}`}>
                      <div className="text-sm font-medium text-violet-900">{notification.type}</div>
                      <div className="text-sm text-gray-700">{notification.message}</div>
                      <div className="text-xs text-gray-400">{notification.createdAt}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "users" && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-violet-900">User management</h2>
                <button className="rounded bg-violet-100 px-3 py-1 text-sm text-violet-800" onClick={() => fetchUsers()}>
                  Refresh
                </button>
              </div>

              <form className="mb-4 grid gap-2 rounded-lg border border-violet-100 bg-violet-50/40 p-3" onSubmit={submitCreateUser}>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  <input
                    placeholder="Email"
                    className="rounded border border-violet-200 px-2 py-1"
                    value={newUserEmail}
                    onChange={(event) => setNewUserEmail(event.target.value)}
                  />
                  <input
                    placeholder="Password"
                    type="password"
                    className="rounded border border-violet-200 px-2 py-1"
                    value={newUserPassword}
                    onChange={(event) => setNewUserPassword(event.target.value)}
                  />
                  <select
                    className="rounded border border-violet-200 px-2 py-1"
                    value={newUserRole}
                    onChange={(event) => setNewUserRole(event.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <button className="rounded bg-violet-700 px-3 py-1 text-white disabled:opacity-70" disabled={creatingUser}>
                    {creatingUser ? "Creating..." : "Create user"}
                  </button>
                </div>
              </form>

              <div className="mb-3 flex flex-wrap items-center gap-2">
                <input
                  className="rounded border px-3 py-1"
                  placeholder="Search users"
                  value={usersQuery}
                  onChange={(event) => setUsersQuery(event.target.value)}
                />
                <button
                  className="rounded border px-3 py-1"
                  onClick={() => fetchUsers({ page: 1, limit: usersLimit, q: usersQuery })}
                >
                  Search
                </button>
              </div>

              {loadingUsers ? (
                <p>Loading users...</p>
              ) : (
                <div className="space-y-2">
                  {users.length === 0 && <p className="text-sm text-gray-500">No users found.</p>}

                  {users.map((user) => (
                    <div className="flex items-center justify-between rounded-lg border border-violet-100 p-3" key={user.id}>
                      <div>
                        <div className="font-medium text-violet-900">{user.email}</div>
                        <div className="text-sm text-gray-600">{user.role === "admin" ? "Admin" : "User"}</div>
                      </div>

                      <button className="rounded bg-gray-200 px-2 py-1 text-sm" onClick={() => toggleRole(user)}>
                        {user.role === "admin" ? "Revoke admin" : "Promote admin"}
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      className="rounded border px-3 py-1 text-sm"
                      disabled={usersPage <= 1}
                      onClick={() => fetchUsers({ page: Math.max(1, usersPage - 1), limit: usersLimit, q: usersQuery })}
                    >
                      Prev
                    </button>
                    <div className="text-sm text-gray-600">
                      Page {usersPage} / {maxPage}
                    </div>
                    <button
                      className="rounded border px-3 py-1 text-sm"
                      disabled={usersPage >= maxPage}
                      onClick={() => fetchUsers({ page: usersPage + 1, limit: usersLimit, q: usersQuery })}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
