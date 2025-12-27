import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Store, Plus, MoreVertical, Edit, Trash2, Bot } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Stores() {
  const [, setLocation] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editStore, setEditStore] = useState<any | null>(null);
  const [deleteStoreId, setDeleteStoreId] = useState<number | null>(null);

  const { data: stores, isLoading, refetch } = trpc.store.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.store.create.useMutation({
    onSuccess: () => {
      toast.success("Store created successfully");
      setIsCreateOpen(false);
      utils.store.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create store");
    },
  });

  const updateMutation = trpc.store.update.useMutation({
    onSuccess: () => {
      toast.success("Store updated successfully");
      setEditStore(null);
      utils.store.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update store");
    },
  });

  const deleteMutation = trpc.store.delete.useMutation({
    onSuccess: () => {
      toast.success("Store deleted successfully");
      setDeleteStoreId(null);
      utils.store.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete store");
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createMutation.mutate({
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      domain: formData.get("domain") as string || undefined,
      storeType: formData.get("storeType") as string || "shopify",
      apiKey: formData.get("apiKey") as string || undefined,
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editStore) return;

    const formData = new FormData(e.currentTarget);

    updateMutation.mutate({
      id: editStore.id,
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      domain: formData.get("domain") as string || undefined,
      storeType: formData.get("storeType") as string || undefined,
      apiKey: formData.get("apiKey") as string || undefined,
      status: formData.get("status") as "active" | "inactive" | "suspended" || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stores</h1>
          <p className="text-muted-foreground">Manage your stores in the marketplace</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Store
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create New Store</DialogTitle>
                <DialogDescription>
                  Add a new store to assign chatbots as channels.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Store Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="My Shopify Store"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Store description..."
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    name="domain"
                    placeholder="mystore.myshopify.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="storeType">Store Type</Label>
                  <Select name="storeType" defaultValue="shopify">
                    <SelectTrigger>
                      <SelectValue placeholder="Select store type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shopify">Shopify</SelectItem>
                      <SelectItem value="woocommerce">WooCommerce</SelectItem>
                      <SelectItem value="magento">Magento</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="apiKey">API Key (Optional)</Label>
                  <Input
                    id="apiKey"
                    name="apiKey"
                    type="password"
                    placeholder="Enter API key..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="gradient-primary">
                  {createMutation.isPending ? "Creating..." : "Create Store"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editStore !== null} onOpenChange={(open) => !open && setEditStore(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Store</DialogTitle>
              <DialogDescription>
                Update store information and settings.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Store Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editStore?.name}
                  placeholder="My Shopify Store"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editStore?.description || ""}
                  placeholder="Store description..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-domain">Domain</Label>
                <Input
                  id="edit-domain"
                  name="domain"
                  defaultValue={editStore?.domain || ""}
                  placeholder="mystore.myshopify.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-storeType">Store Type</Label>
                <Select name="storeType" defaultValue={editStore?.storeType || "shopify"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select store type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shopify">Shopify</SelectItem>
                    <SelectItem value="woocommerce">WooCommerce</SelectItem>
                    <SelectItem value="magento">Magento</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select name="status" defaultValue={editStore?.status || "active"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditStore(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="gradient-primary">
                {updateMutation.isPending ? "Updating..." : "Update Store"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stores Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stores && stores.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Card key={store.id} className="group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Store className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{store.name}</CardTitle>
                      <CardDescription className="text-xs">{store.storeType}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditStore(store)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation(`/stores/${store.id}/channels`)}>
                        <Bot className="w-4 h-4 mr-2" />
                        Manage Channels
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteStoreId(store.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {store.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{store.description}</p>
                )}
                {store.domain && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Domain:</span> {store.domain}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className={`status-${store.status} px-2 py-1 rounded-full text-xs font-medium`}>
                    {store.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(store.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Store className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No stores yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Create your first store to start assigning chatbots as channels.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Store
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteStoreId !== null} onOpenChange={() => setDeleteStoreId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Store</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this store? This action cannot be undone and will remove all channel assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteStoreId && deleteMutation.mutate({ id: deleteStoreId })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
