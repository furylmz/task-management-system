using AutoMapper;
using TaskManagement.API.DTOs.Categories;
using TaskManagement.API.DTOs.Comments;
using TaskManagement.API.DTOs.Tasks;
using TaskManagement.API.DTOs.Users;
using TaskManagement.API.Models;

namespace TaskManagement.API.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>();
        CreateMap<CreateUserDto, User>();
        CreateMap<UpdateUserDto, User>();

        CreateMap<Category, CategoryDto>();
        CreateMap<CreateCategoryDto, Category>();
        CreateMap<UpdateCategoryDto, Category>();

        CreateMap<TaskItem, TaskItemDto>();
        CreateMap<CreateTaskDto, TaskItem>();
        CreateMap<UpdateTaskDto, TaskItem>();

        CreateMap<TaskComment, TaskCommentDto>();
        CreateMap<CreateTaskCommentDto, TaskComment>();
        CreateMap<UpdateTaskCommentDto, TaskComment>();
    }
}