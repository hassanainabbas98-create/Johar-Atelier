using Johar.Services.DTOs;

namespace Johar.Services.Interfaces;

public interface ICollectionService
{
    Task<IReadOnlyList<CollectionDto>> GetPublishedCollectionsAsync();
    Task<IReadOnlyList<CollectionDto>> GetAllCollectionsAsync();
    Task<CollectionDto> GetCollectionByIdAsync(int id);
    Task<CollectionDto> CreateCollectionAsync(CollectionUpsertDto dto);
    Task<CollectionDto> UpdateCollectionAsync(int id, CollectionUpsertDto dto);
    Task DeleteCollectionAsync(int id);
}
