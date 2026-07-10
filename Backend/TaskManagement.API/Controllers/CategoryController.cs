using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.API.DTOs.Categories;
using TaskManagement.API.Services.Interfaces;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetAll()
    {
        var userId = GetUserId();

        var categories = await _categoryService.GetAllByUserIdAsync(userId);

        return Ok(categories);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CategoryDto>> GetById(Guid id)
    {
        var userId = GetUserId();

        var category = await _categoryService.GetByIdAsync(id, userId);

        if (category == null)
        {
            return NotFound(new { message = "Category not found." });
        }

        return Ok(category);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create(
        CreateCategoryDto createCategoryDto)
    {
        var userId = GetUserId();

        try
        {
            var category = await _categoryService.CreateAsync(
                userId,
                createCategoryDto);

            return Ok(category);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CategoryDto>> Update(
        Guid id,
        UpdateCategoryDto updateCategoryDto)
    {
        var userId = GetUserId();

        try
        {
            var category = await _categoryService.UpdateAsync(
                id,
                userId,
                updateCategoryDto);

            if (category == null)
            {
                return NotFound(new { message = "Category not found." });
            }

            return Ok(category);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();

        var deleted = await _categoryService.DeleteAsync(id, userId);

        if (!deleted)
        {
            return NotFound(new { message = "Category not found." });
        }

        return NoContent();
    }

    private Guid GetUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            throw new UnauthorizedAccessException(
                "User identifier is missing or invalid.");
        }

        return userId;
    }
}