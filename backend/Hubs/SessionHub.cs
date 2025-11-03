using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;


[Authorize]
public class SessionHub : Hub
{
    public static string GroupName(int sessionId) => $"session-{sessionId}";

    public Task JoinSession(int sessionId) =>
        Groups.AddToGroupAsync(Context.ConnectionId, GroupName(sessionId));


    public Task LeaveSession(int sessionId) =>
        Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(sessionId));
}