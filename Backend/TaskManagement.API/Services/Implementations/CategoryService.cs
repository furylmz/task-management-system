using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.DTOs.Categories;
using TaskManagement.API.Models;
using TaskManagement.API.Services.Interfaces;
using TaskManagement.API.Exceptions;

namespace TaskManagement.API.Services.Implementations;

public class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CategoryService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<CategoryDto>> GetAllByUserIdAsync(Guid userId)
    {
        var categories = await _context.Categories
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .ToListAsync();

        return _mapper.Map<List<CategoryDto>>(categories);
    }

    public async Task<CategoryDto?> GetByIdAsync(Guid id, Guid userId)
    {
        var category = await _context.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        return category == null ? null : _mapper.Map<CategoryDto>(category);
    }

    public async Task<CategoryDto> CreateAsync(Guid userId, CreateCategoryDto createCategoryDto)
    {
        var nameExists = await _context.Categories
            .AnyAsync(x => x.UserId == userId && x.Name == createCategoryDto.Name);

        if (nameExists)
        {
            throw new ConflictException("Category name is already used.");
        }

        var category = _mapper.Map<Category>(createCategoryDto);

        category.Id = Guid.NewGuid();
        category.UserId = userId;
        category.CreatedAt = DateTime.UtcNow;

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return _mapper.Map<CategoryDto>(category);
    }

    public async Task<CategoryDto?> UpdateAsync(Guid id, Guid userId, UpdateCategoryDto updateCategoryDto)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (category == null)
        {
            return null;
        }

        var nameExists = await _context.Categories.AnyAsync(x => x.UserId == userId &&
                                                            x.Name == updateCategoryDto.Name &&
                                                            x.Id != id);

        if (nameExists)
        {
            throw new ConflictException("Category name is already used.");
        }

        category.Name = updateCategoryDto.Name;
        category.Description = updateCategoryDto.Description;
        category.Color = updateCategoryDto.Color;

        await _context.SaveChangesAsync();

        return _mapper.Map<CategoryDto>(category);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (category == null)
        {
            return false;
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return true;
    }
}