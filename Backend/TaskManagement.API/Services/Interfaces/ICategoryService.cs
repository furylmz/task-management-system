using TaskManagement.API.DTOs.Categories;

namespace TaskManagement.API.Services.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllByUserIdAsync(Guid userId);

    Task<CategoryDto?> GetByIdAsync(Guid id, Guid userId);

    Task<CategoryDto> CreateAsync(Guid userId, CreateCategoryDto createCategoryDto);

    Task<CategoryDto?> UpdateAsync(Guid id, Guid userId, UpdateCategoryDto updateCategoryDto);

    Task<bool> DeleteAsync(Guid id, Guid userId);
}