# VIVA PREPARATION GUIDE - Your Implementation

## 1. WHAT IS REST? (REPRESENTATIONAL STATE TRANSFER)

**Definition:**  
REST is an architectural style for building web APIs using HTTP methods to perform CRUD operations on resources identified by URLs. It uses standard HTTP verbs (GET, POST, PUT, DELETE) to interact with data stateless.

### Where You Used It:
Your **Smart Campus API** is a RESTful backend built with Spring Boot.

**Example Endpoints You Created:**

```java
// TicketController.java - REST endpoints for ticket management
@RestController
@RequestMapping("/api/tickets")
public class TicketController {
    
    // GET - Retrieve all tickets
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getTickets(
        @RequestParam(required = false) String status,
        Authentication auth)
    
    // GET by ID - Retrieve specific ticket
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getTicket(@PathVariable Long id)
    
    // POST - Create new ticket
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> createTicket(
        @RequestPart("facilityName") String facilityName,
        @RequestPart("category") String category,
        @RequestPart("description") String description,
        @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments,
        Authentication auth)
    
    // PUT - Update ticket (status, assignment)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateTicket(
        @PathVariable Long id,
        @Valid @RequestBody TicketUpdateRequest request,
        Authentication auth)
    
    // DELETE - Delete ticket
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteTicket(
        @PathVariable Long id,
        Authentication auth)
}
```

**Why REST?** Enables clear, intuitive API design where URLs represent resources and HTTP methods represent actions.

---

## 2. CONSTRAINTS (VALIDATION)

**Definition:**  
Constraints are rules enforced on data to ensure only valid information enters the system. In Spring, you use **Jakarta Bean Validation annotations** on DTOs.

### Backend Constraints (Where You Used Them):

**File:** `smart-campus-api/src/main/java/com/smartcampus/dto/ResourceDTO.java`

```java
@Getter @Setter
public class ResourceDTO {
    
    // Constraint: Name cannot be empty
    @NotBlank(message = "Name is required")
    private String name;
    
    // Constraint: Type must be selected
    @NotNull(message = "Type is required")
    private ResourceType type;
    
    // Constraint: Capacity must be provided and >= 1
    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;
    
    // Constraint: Location is mandatory
    @NotBlank(message = "Location is required")
    private String location;
    
    // Constraint: Description max 1000 chars
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    // Constraint: At least one availability window
    @NotEmpty(message = "At least one availability window is required")
    private List<@NotBlank String> availabilityWindows;
    
    // Constraint: Status must be provided
    @NotNull(message = "Status is required")
    private ResourceStatus status;
}
```

**Where Constraints Are Enforced:**

```java
// In ResourceController.java
@PostMapping
public ResponseEntity<ApiResponse<ResourceDTO>> createResource(
    @Valid @RequestBody ResourceDTO resourceDTO) {  // @Valid triggers validation
    // If ANY constraint fails → 400 Bad Request response
    // Client receives: "Name is required" error message
    return service.createResource(resourceDTO);
}
```

### Frontend Constraints (JavaScript Validation):

**File:** `client/src/pages/ResourceForm.jsx`

```javascript
// Manual validation before sending to backend
const validate = () => {
    const nextErrors = {};
    
    // Constraint 1: Name required
    if (!form.name.trim()) {
        nextErrors.name = 'Name is required';
    }
    
    // Constraint 2: Location required
    if (!form.location.trim()) {
        nextErrors.location = 'Location is required';
    }
    
    // Constraint 3: Capacity >= 1
    const capacityValue = Number(form.capacity);
    if (!form.capacity || isNaN(capacityValue) || capacityValue < 1) {
        nextErrors.capacity = 'Capacity must be 1 or more';
    }
    
    // Constraint 4: Type required
    if (!form.type || form.type === '') {
        nextErrors.type = 'Type is required';
    }
    
    // Constraint 5: At least 1 availability window
    if (!Array.isArray(form.availabilityWindows) || 
        form.availabilityWindows.length === 0) {
        nextErrors.availabilityWindows = 
            'Provide at least one availability window';
    }
    
    return nextErrors;
};
```

**Why Constraints?** Prevents invalid data from entering your system on BOTH frontend (UX) and backend (security).

---

## 3. HOOKS (React Hooks)

**Definition:**  
Hooks are JavaScript functions that let you "hook into" React features like state and lifecycle. Common hooks: `useState`, `useEffect`, `useContext`, `useMemo`.

### useState Hook - Manage Component State

**File:** `client/src/pages/TicketFormPage.jsx`

```javascript
// Single state variable for form data
const [form, setForm] = useState({
    facilityName: '',
    category: 'IT',
    priority: 'MEDIUM',
    description: '',
    attachments: []
});

// Multiple state variables for different concerns
const [files, setFiles] = useState([]);
const [previews, setPreviews] = useState([]);
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

// Update form when user types
const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
        ...prev,
        [name]: value
    }));
};

// Update file list when user selects files
const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    
    // Generate previews
    const newPreviews = selectedFiles.map(f => URL.createObjectURL(f));
    setPreviews(newPreviews);
};
```

### useEffect Hook - Side Effects (API Calls)

**File:** `client/src/pages/TicketListPage.jsx`

```javascript
const [tickets, setTickets] = useState([]);
const [loading, setLoading] = useState(false);
const [statusFilter, setStatusFilter] = useState('');
const { token } = useContext(AuthContext);

// Run when component mounts or when token/filter changes
useEffect(() => {
    const fetchTickets = async () => {
        setLoading(true);
        try {
            // Build API URL with filters
            const url = `/api/tickets${statusFilter ? `?status=${statusFilter}` : ''}`;
            
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setTickets(response.data.data);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };
    
    fetchTickets();
}, [token, statusFilter]); // Re-run when these change
```

### useContext Hook - Global State

**File:** `client/src/context/AuthContext.jsx`

```javascript
// Create context
export const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    
    useEffect(() => {
        // Fetch user profile when token changes
        const fetchUser = async () => {
            if (!token) {
                setUser(null);
                return;
            }
            try {
                const res = await axios.get('/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data.data);  // Store user globally
            } catch (err) {
                setToken(null);
                setUser(null);
            }
        };
        fetchUser();
    }, [token]);
    
    // Provide state + functions to all components
    return (
        <AuthContext.Provider value={{ user, token, setToken }}>
            {children}
        </AuthContext.Provider>
    );
}

// Usage in any component
const { user, token } = useContext(AuthContext);  // Access global state
```

### useMemo Hook - Optimize Performance

**File:** `client/src/pages/ResourceList.jsx`

```javascript
const [resources, setResources] = useState([]);
const [filterType, setFilterType] = useState('ALL');

// Memoized: Only recalculate when resources/filterType change
const filteredResources = useMemo(() => {
    if (filterType === 'ALL') return resources;
    return resources.filter(r => r.type === filterType);
}, [resources, filterType]);

// Memoized: Only recalculate when resources change
const totalCapacity = useMemo(() => {
    return resources.reduce((sum, r) => sum + r.capacity, 0);
}, [resources]);

return (
    <div>
        <p>Total Capacity: {totalCapacity}</p>
        {filteredResources.map(r => <ResourceCard key={r.id} resource={r} />)}
    </div>
);
```

**Why Hooks?** Cleaner state management, easier to share logic between components, better performance optimization.

---

## 4. USAGE OF HOOKS (Where and Why)

| Hook | Component | Purpose |
|------|-----------|---------|
| **useState** | TicketFormPage, ResourceForm, TicketListPage | Manage form data, loading state, filter state |
| **useEffect** | All pages with API calls | Fetch data from backend, validate tokens |
| **useContext** | All pages | Access global auth state (user, token) |
| **useMemo** | ResourceList, TicketListPage | Optimize filtered/computed lists |

---

## 5. FRONTEND VALIDATIONS (Client-Side)

**Definition:**  
Frontend validation checks user input BEFORE sending to backend. Improves UX (instant feedback) but NOT trusted for security.

### Form Validation Example

**File:** `client/src/pages/ResourceForm.jsx`

```javascript
const validate = () => {
    const nextErrors = {};
    
    // 1. Name field validation
    if (!form.name.trim()) {
        nextErrors.name = 'Name is required';
    }
    
    // 2. Capacity validation (must be number >= 1)
    const capacityValue = Number(form.capacity);
    if (!form.capacity || isNaN(capacityValue) || capacityValue < 1) {
        nextErrors.capacity = 'Capacity must be 1 or more';
    }
    
    // 3. Complex nested validation (availability windows)
    if (!Array.isArray(form.availabilityWindows) || 
        form.availabilityWindows.length === 0) {
        nextErrors.availabilityWindows = 
            'Provide at least one availability window';
    } else {
        // Check each window has valid times
        const hasInvalidWindow = form.availabilityWindows.some(w => 
            !w.day || !w.startTime || !w.endTime || w.startTime >= w.endTime
        );
        if (hasInvalidWindow) {
            nextErrors.availabilityWindows = 
                'Each window must have valid start/end times';
        }
    }
    
    return nextErrors;
};

// Called before submission
const handleSubmit = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);  // Show error messages
        return;  // Don't submit
    }
    
    // Valid data - send to backend
    await submitForm();
};
```

### Real-Time Validation Example

**File:** `client/src/pages/TicketFormPage.jsx`

```javascript
const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field as user types
    setError('');
    
    setForm(prev => ({
        ...prev,
        [name]: value
    }));
};

// Validate on submit
const handleSubmit = async () => {
    // Required field checks
    if (!form.facilityName.trim() || !form.description.trim()) {
        setError('Facility name and description are required.');
        return;
    }
    
    setLoading(true);
    try {
        // Valid - submit to API
        await createTicket();
    } catch (error) {
        setError(error.response?.data?.message || 'Failed to create ticket');
    } finally {
        setLoading(false);
    }
};
```

---

## 6. BACKEND VALIDATIONS (Server-Side)

**Definition:**  
Backend validation enforces rules server-side. This is TRUSTED and prevents invalid data from reaching the database.

### Automatic Validation with @Valid

**File:** `smart-campus-api/src/main/java/com/smartcampus/controller/ResourceController.java`

```java
@PostMapping
public ResponseEntity<ApiResponse<ResourceDTO>> createResource(
    @Valid @RequestBody ResourceDTO resourceDTO) {  // @Valid = validate constraints
    
    // If ANY @NotBlank, @NotNull, @Min constraints fail:
    // Spring automatically returns 400 Bad Request
    // with error details like:
    // {
    //   "field": "capacity",
    //   "message": "Capacity must be at least 1"
    // }
    
    // If we reach here, ALL constraints passed
    return new ResponseEntity<>(
        apiResponse.success(service.createResource(resourceDTO)),
        HttpStatus.CREATED
    );
}
```

### Custom Backend Validation

**File:** `smart-campus-api/src/main/java/com/smartcampus/service/TicketService.java`

```java
@Service
public class TicketService {
    
    public TicketDTO createTicket(String facilityName, String description, ...) {
        // Business logic validation
        
        // 1. Check facility exists
        Facility facility = facilityRepository.findByName(facilityName)
            .orElseThrow(() -> new ResourceNotFoundException("Facility not found"));
        
        // 2. Check user has permission
        User requester = (User) SecurityContextHolder.getContext()
            .getAuthentication().getPrincipal();
        
        if (!requester.getRole().equals(Role.USER)) {
            throw new AccessDeniedException("Only users can create tickets");
        }
        
        // 3. Validate file types if attachments provided
        if (attachments != null && !attachments.isEmpty()) {
            for (MultipartFile file : attachments) {
                if (!isValidFileType(file)) {
                    throw new InvalidFileException("Invalid file type");
                }
            }
        }
        
        // All validations passed - create ticket
        Ticket ticket = new Ticket();
        ticket.setFacilityName(facilityName);
        ticket.setDescription(description);
        // ... set other fields
        
        return ticketRepository.save(ticket);
    }
}
```

---

## 7. CONTROLLERS & ENDPOINTS

**Definition:**  
Controllers are REST API entry points. They receive HTTP requests, validate data, call services, and return responses.

### Your Controllers:

**File:** `smart-campus-api/src/main/java/com/smartcampus/controller/TicketController.java`

```java
@RestController
@RequestMapping("/api/tickets")
public class TicketController {
    
    @Autowired
    private TicketService ticketService;
    
    // Endpoint 1: GET all tickets (with role-based filtering)
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getTickets(
        @RequestParam(required = false) String status,
        Authentication auth) {
        
        // Controller gets HTTP request
        // Calls service for business logic
        // Returns response
        List<TicketDTO> tickets = ticketService.getTickets(auth, status);
        
        return ResponseEntity.ok(
            new ApiResponse<>(200, "Success", tickets)
        );
    }
    
    // Endpoint 2: POST create ticket (with file upload)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> createTicket(
        @RequestPart("facilityName") String facilityName,
        @RequestPart("description") String description,
        @RequestPart(value = "attachments", required = false) 
        List<MultipartFile> attachments,
        Authentication auth) {
        
        // Controller receives multipart form data
        // Passes to service for validation + processing
        TicketDTO newTicket = ticketService.createTicket(
            facilityName, description, attachments, auth
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(
            new ApiResponse<>(201, "Ticket created", newTicket)
        );
    }
    
    // Endpoint 3: PUT update ticket status
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateTicket(
        @PathVariable Long id,
        @Valid @RequestBody TicketUpdateRequest request,  // Validates request body
        Authentication auth) {
        
        TicketDTO updated = ticketService.updateTicket(id, request, auth);
        
        return ResponseEntity.ok(
            new ApiResponse<>(200, "Ticket updated", updated)
        );
    }
    
    // Endpoint 4: DELETE ticket
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteTicket(
        @PathVariable Long id,
        Authentication auth) {
        
        ticketService.deleteTicket(id, auth);
        
        return ResponseEntity.ok(
            new ApiResponse<>(200, "Ticket deleted", null)
        );
    }
}
```

### Other Controllers You Created:

| Controller | Endpoints | File |
|-----------|-----------|------|
| **UserController** | GET all users, PUT update role | `smart-campus-api/.../controller/UserController.java` |
| **ResourceController** | POST create, GET list/detail, PUT update, DELETE | `smart-campus-api/.../controller/ResourceController.java` |
| **AuthController** | GET current user, POST OAuth callback | `smart-campus-api/.../controller/AuthController.java` |
| **AnalyticsController** | GET dashboard analytics | `smart-campus-api/.../controller/AnalyticsController.java` |
| **NotificationController** | GET/POST/DELETE notifications | `smart-campus-api/.../controller/NotificationController.java` |

---

## 8. ROLE-BASED ACCESS CONTROL (RBAC) IMPLEMENTATION

**Definition:**  
RBAC restricts who can access what. Users have roles (ADMIN, TECHNICIAN, USER), and endpoints check roles before executing.

### Backend RBAC Implementation

**File:** `smart-campus-api/src/main/java/com/smartcampus/security/JwtFilter.java`

```java
@Component
public class JwtFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain chain) 
            throws ServletException, IOException {
        
        // 1. Extract JWT token from Authorization header
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            
            // 2. Validate token signature
            if (jwtUtil.validateToken(token)) {
                // 3. Extract user email from token
                String email = jwtUtil.extractEmail(token);
                
                // 4. Load user from database with their ROLE
                User user = userRepository.findByEmail(email).orElse(null);
                if (user != null) {
                    // 5. Create authentication with user's ROLE
                    var auth = new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
                        // ROLE_ prefix is Spring Security convention
                    );
                    
                    // 6. Set in SecurityContext (available to controller)
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        }
        
        // Continue request processing
        chain.doFilter(request, response);
    }
}
```

### Method-Level Authorization

**File:** `smart-campus-api/src/main/java/com/smartcampus/controller/UserController.java`

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    // Only ADMIN can access this
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getAllUsers() {
        // If current user role != ADMIN:
        // Spring blocks request, returns 403 Forbidden
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", users));
    }
    
    // Only ADMIN can update roles
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> changeRole(
        @PathVariable Long id,
        @Valid @RequestBody RoleUpdateDto dto) {
        
        UserDTO updated = userService.updateUserRole(id, dto.getRole());
        return ResponseEntity.ok(new ApiResponse<>(200, "Role updated", updated));
    }
    
    // TECHNICIAN or ADMIN can view
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<?>> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", user));
    }
}
```

### Service-Level Role Checking

**File:** `smart-campus-api/src/main/java/com/smartcampus/service/TicketService.java`

```java
@Service
public class TicketService {
    
    public List<TicketDTO> getTickets(Authentication auth, String status) {
        User currentUser = (User) auth.getPrincipal();
        String role = currentUser.getRole().name();  // ADMIN, TECHNICIAN, USER
        
        // Business logic: Different queries based on role
        if (role.equals("ADMIN")) {
            // Admin sees ALL tickets
            return ticketRepository.findAll();
        } else if (role.equals("TECHNICIAN")) {
            // Technician sees only ASSIGNED tickets
            return ticketRepository.findByAssignedTechnicianId(currentUser.getId());
        } else if (role.equals("USER")) {
            // User sees only their OWN tickets
            return ticketRepository.findByCreatedById(currentUser.getId());
        }
        
        return Collections.emptyList();
    }
}
```

### Frontend RBAC Implementation

**File:** `client/src/routes/ProtectedRoute.jsx`

```javascript
export default function ProtectedRoute({ 
    children, 
    requiredRole,      // Single role required
    allowedRoles       // Multiple roles allowed
}) {
    const { user, token, loading } = useContext(AuthContext);
    
    if (loading) {
        return <LoadingSpinner />;
    }
    
    // 1. Check if user is authenticated
    if (!token) {
        return <Navigate to="/login" />;
    }
    
    // 2. Check role (if specified)
    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/unauthorized" />;
    }
    
    // 3. Check if user's role is in allowed list
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/unauthorized" />;
    }
    
    // All checks passed - render component
    return children;
}

// Usage in routing
<ProtectedRoute requiredRole="ADMIN">
    <AdminUsersPage />
</ProtectedRoute>

<ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN']}>
    <TicketAssignmentPage />
</ProtectedRoute>
```

### Role-Based Navigation

**File:** `client/src/routes/RoleHomeRedirect.jsx`

```javascript
export default function RoleHomeRedirect() {
    const { user, loading } = useContext(AuthContext);
    
    if (loading) return <LoadingSpinner />;
    
    // Redirect to different dashboard based on role
    switch (user?.role) {
        case 'ADMIN':
            return <Navigate to="/admin/dashboard" />;
        case 'TECHNICIAN':
            return <Navigate to="/technician/view" />;
        case 'USER':
            return <Navigate to="/dashboard" />;
        default:
            return <Navigate to="/login" />;
    }
}
```

---

## 9. USE STATES (useState Hook Examples)

Already detailed in Section 3. Here's a quick summary:

### useState Pattern 1: Simple Value

```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
```

### useState Pattern 2: Complex Object

```javascript
const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'USER'
});

// Update single field
setForm(prev => ({
    ...prev,
    name: 'John'
}));
```

### useState Pattern 3: Array

```javascript
const [files, setFiles] = useState([]);

// Add to array
setFiles(prev => [...prev, newFile]);

// Remove from array
setFiles(prev => prev.filter(f => f.id !== idToRemove));
```

---

## 10. ANNOTATIONS & THEIR USAGE

**Definition:**  
Annotations are metadata that provide instructions to the framework without affecting code execution directly.

### REST Mapping Annotations

```java
@RestController              // Marks class as REST API controller
@RequestMapping("/api/users")  // Base URL for all endpoints

@GetMapping              // Maps HTTP GET request
@PostMapping             // Maps HTTP POST request (create)
@PutMapping              // Maps HTTP PUT request (update)
@PatchMapping            // Maps HTTP PATCH request (partial update)
@DeleteMapping           // Maps HTTP DELETE request

@PathVariable            // Extract from URL: /users/{id}
@RequestBody             // Parse JSON body
@RequestParam            // Query parameter: ?status=OPEN
@RequestPart             // Multipart form data (file upload)
```

### Validation Annotations

```java
@Valid                       // Trigger validation on nested object
@NotNull                     // Must not be null
@NotBlank                    // String must not be empty/blank
@NotEmpty                    // Collection must not be empty
@Min(value = 1)              // Minimum numeric value
@Max(value = 100)            // Maximum numeric value
@Size(min = 2, max = 50)     // String/collection size
@Email                       // Valid email format
@Pattern(regexp = "...")     // Must match regex
```

### Dependency Injection Annotations

```java
@Service                 // Marks as service component (business logic)
@Repository              // Marks as repository (data access)
@Component               // Generic component
@Autowired               // Inject dependency
```

### Security Annotations

```java
@PreAuthorize("hasRole('ADMIN')")           // Method level authorization
@PreAuthorize("hasAnyRole('ADMIN', 'TECH')")// Multiple roles
@Secured("ROLE_ADMIN")                      // Alternative syntax
```

### Spring Boot Annotations

```java
@Configuration           // Marks class for Spring configuration
@Bean                    // Registers bean in Spring context
@EnableMethodSecurity    // Enables @PreAuthorize on methods
@Transactional           // DB transaction management
```

### Lombok Annotations (Data Class Generation)

```java
@Getter              // Auto-generates getter methods
@Setter              // Auto-generates setter methods
@Data                // @Getter + @Setter + @ToString + @EqualsAndHashCode
@NoArgsConstructor   // Generates no-arg constructor
@AllArgsConstructor  // Generates constructor with all fields
```

### Example: Full Annotated Class

```java
@Entity
@Table(name = "resources")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotNull(message = "Type is required")
    private ResourceType type;
    
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

### Example: Annotated Controller

```java
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor  // Lombok: inject final fields
public class ResourceController {
    
    private final ResourceService service;
    
    @PostMapping
    public ResponseEntity<ApiResponse<ResourceDTO>> create(
        @Valid @RequestBody ResourceDTO dto) {  // Validate DTO
        
        ResourceDTO saved = service.save(dto);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(new ApiResponse<>(201, "Created", saved));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")  // Role check
    public ResponseEntity<ApiResponse<List<ResourceDTO>>> getAll(
        @RequestParam(required = false) ResourceType type) {
        
        List<ResourceDTO> resources = service.findByType(type);
        return ResponseEntity.ok(
            new ApiResponse<>(200, "Success", resources)
        );
    }
}
```

---

## SUMMARY FOR VIVA

### What You Implemented:

✅ **REST API** - Full CRUD endpoints for Tickets, Resources, Users, Notifications  
✅ **Constraints** - Jakarta Bean Validation on backend + JavaScript validation on frontend  
✅ **Hooks** - useState, useEffect, useContext, useMemo in React components  
✅ **Frontend Validations** - Real-time form validation with error messages  
✅ **Backend Validations** - @Valid constraint checking, business logic validation  
✅ **Controllers** - 7 REST controllers handling requests  
✅ **RBAC** - JWT token extraction → role assignment → @PreAuthorize checks  
✅ **Use States** - Form data, loading states, filters, authentication state  
✅ **Annotations** - 30+ Spring/Jakarta annotations for REST, validation, security, DI  

### Key Files to Reference:

**Backend:**
- Controllers: `smart-campus-api/src/main/java/com/smartcampus/controller/`
- Services: `smart-campus-api/src/main/java/com/smartcampus/service/`
- DTOs: `smart-campus-api/src/main/java/com/smartcampus/dto/`
- Security: `smart-campus-api/src/main/java/com/smartcampus/security/`

**Frontend:**
- Pages: `client/src/pages/`
- Context: `client/src/context/AuthContext.jsx`
- Routes: `client/src/routes/`

---

## VIVA Tips:

1. **When asked "What is REST?"** → Say: "It's architectural style using HTTP methods (GET, POST, PUT, DELETE) to manipulate resources at URLs."

2. **When asked "Where did you use constraints?"** → Show `ResourceDTO.java` with @NotBlank, @NotNull, @Min annotations.

3. **When asked "What hooks did you use?"** → Answer: "useState for form/filter state, useEffect for API calls, useContext for global auth state, useMemo for performance."

4. **When asked "How does role-based access work?"** → Explain: "JWT token decoded → Role extracted → @PreAuthorize checks role → Access granted/denied."

5. **When asked for code examples** → Have these files ready to show:
   - Validation: `ResourceDTO.java` + `ResourceForm.jsx`
   - Hooks: `TicketFormPage.jsx` + `AuthContext.jsx`
   - RBAC: `JwtFilter.java` + `ProtectedRoute.jsx`
   - Controllers: `TicketController.java` + `ResourceController.java`

Good luck in your viva! 🎯
