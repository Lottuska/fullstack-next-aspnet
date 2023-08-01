using BookApp.Data;
using BookApp.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookApp.Controllers
{
    [EnableCors]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private static AppDbContext _context;

        public BooksController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet] // api/Books
        public async Task<IActionResult> Get()
        {
            var books = await _context.Books.ToListAsync();
            return Ok(books);
        }

        [HttpGet("{id:int}")] // api/Books/1
        public async Task<IActionResult> Get(int id)
        {
            var book = await _context.Books.FirstOrDefaultAsync(x => x.Id == id);
            if (book == null)
            {
                return BadRequest("Invalid Id");
            }
            return Ok(book);
        }

        [HttpPost] // api/Books
        public async Task<IActionResult> Post(Book book)
        {
            await _context.Books.AddAsync(book);
            await _context.SaveChangesAsync();

            return CreatedAtAction("Get", book.Id, book);
        }

        [HttpPatch] // api/Books
        public async Task<IActionResult> Patch(int id, string description)
        {
            var book = await _context.Books.FirstOrDefaultAsync(x => x.Id == id);
            if (book == null)
            {
                return BadRequest("Invalid id");
            }

            book.Description = description;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete] // api/Books
        public async Task<IActionResult> Delete(int id)
        {
            var book = await _context.Books.FirstOrDefaultAsync(x => x.Id == id);
            if (book == null)
            {
                return BadRequest("Invalid id");
            }

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
