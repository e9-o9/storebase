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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Bot, Plus, X, Link2, Activity } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function StoreChannels() {
  const [, params] = useRoute("/stores/:storeId/channels");
  const storeId = Number(params?.storeId);
  const [, setLocation] = useLocation();
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");

  const { data: store } = trpc.store.get.useQuery({ id: storeId });
  const { data: channels, refetch: refetchChannels } = trpc.channel.getByStore.useQuery({ storeId });
  const { data: agents } = trpc.agent.list.useQuery();
  const utils = trpc.useUtils();

  const assignMutation = trpc.channel.assign.useMutation({
    onSuccess: () => {
      toast.success("Agent assigned successfully");
      setIsAssignOpen(false);
      setSelectedAgentId("");
      refetchChannels();
      utils.channel.getByStore.invalidate({ storeId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign agent");
    },
  });

  const unassignMutation = trpc.channel.unassign.useMutation({
    onSuccess: () => {
      toast.success("Agent unassigned successfully");
      refetchChannels();
      utils.channel.getByStore.invalidate({ storeId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unassign agent");
    },
  });

  const updateStatusMutation = trpc.channel.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Channel status updated");
      refetchChannels();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const handleAssign = () => {
    if (!selectedAgentId) {
      toast.error("Please select an agent");
      return;
    }

    assignMutation.mutate({
      agentId: Number(selectedAgentId),
      storeId,
      channelName: `Channel for ${store?.name}`,
    });
  };

  // Filter out agents that are already assigned
  const assignedAgentIds = useMemo(
    () => new Set(channels?.map(c => c.agentId) || []),
    [channels]
  );
  const availableAgents = useMemo(
    () => agents?.filter(a => !assignedAgentIds.has(a.id)) || [],
    [agents, assignedAgentIds]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/stores")}
            className="mb-2"
          >
            ← Back to Stores
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {store?.name} - Channels
          </h1>
          <p className="text-muted-foreground">Manage chatbot channels for this store</p>
        </div>
        <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary" disabled={availableAgents.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Assign Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Assign Agent to Store</DialogTitle>
              <DialogDescription>
                Select an agent to assign as a channel for this store.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="agent">Select Agent</Label>
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents.map((agent) => (
                      <SelectItem key={agent.id} value={String(agent.id)}>
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4" />
                          {agent.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAssignOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={assignMutation.isPending || !selectedAgentId}
                className="gradient-primary"
              >
                {assignMutation.isPending ? "Assigning..." : "Assign Channel"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Store Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Store Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Type:</span>
            <span className="text-sm font-medium">{store?.storeType}</span>
          </div>
          {store?.domain && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Domain:</span>
              <span className="text-sm font-medium">{store.domain}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <span className={`status-${store?.status} px-2 py-1 rounded-full text-xs font-medium`}>
              {store?.status}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Channels List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Assigned Channels</h2>
        {channels && channels.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {channels.map((channel) => (
              <Card key={channel.id} className="group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{channel.agent.name}</CardTitle>
                        <CardDescription className="text-xs">{channel.agent.model}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => unassignMutation.mutate({
                        agentId: channel.agentId,
                        storeId: channel.storeId,
                      })}
                      disabled={unassignMutation.isPending}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {channel.channelName && (
                    <div className="text-sm text-muted-foreground">
                      <Link2 className="w-3 h-3 inline mr-1" />
                      {channel.channelName}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Active</span>
                    </div>
                    <Switch
                      checked={channel.isActive === 1}
                      onCheckedChange={(checked) => {
                        updateStatusMutation.mutate({
                          agentId: channel.agentId,
                          storeId: channel.storeId,
                          isActive: checked ? 1 : 0,
                        });
                      }}
                      disabled={updateStatusMutation.isPending}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Assigned {new Date(channel.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">No channels assigned</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Assign chatbot agents as channels to enable them for this store
              </p>
              <Button
                onClick={() => setIsAssignOpen(true)}
                className="gradient-primary"
                disabled={availableAgents.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Assign First Channel
              </Button>
              {availableAgents.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Create agents first to assign them to this store
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Available Agents Info */}
      {availableAgents.length > 0 && channels && channels.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              {availableAgents.length} more agent{availableAgents.length !== 1 ? 's' : ''} available to assign
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
