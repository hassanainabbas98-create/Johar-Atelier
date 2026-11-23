namespace Johar.Services.Common;

/// <summary>
/// Server-calculated pagination response contract supporting the
/// [Dynamic Pagination: Displaying X of Y Artworks] UI requirement.
/// </summary>
/// <typeparam name="T">Type of item payload</typeparam>
public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; init; } = Array.Empty<T>();
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
    public bool HasMore => Page * PageSize < TotalCount;
    public bool HasPrevious => Page > 1;

    public PagedResult(IReadOnlyList<T> items, int totalCount, int page, int pageSize)
    {
        Items = items;
        TotalCount = totalCount;
        Page = page;
        PageSize = pageSize;
    }
}
