package sih.sql_service.services;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sih.sql_service.dtos.LoginRequestDto;
import sih.sql_service.dtos.LoginResponseDto;
import sih.sql_service.entities.Citizen;
import sih.sql_service.entities.Employee;
import sih.sql_service.repositories.CitizenRepository;
import sih.sql_service.repositories.EmployeeRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final EmployeeRepository employeeRepository;
    private final CitizenRepository citizenRepository;

    @PostConstruct
    public void seedDefaultEmployees() {
        try {
            seedEmployeeIfNotExists(
                    "EMP-NER-001",
                    "Rajesh Sharma",
                    "admin",
                    "MDoNER Employee",
                    "Geotechnical Central Command",
                    "Sikkim",
                    "North Sikkim"
            );

            seedEmployeeIfNotExists(
                    "ZONAL-SK-01",
                    "Pemba Tshering",
                    "admin",
                    "Zonal Admin",
                    "NER Zonal Disaster Operations",
                    "Sikkim",
                    "All Sikkim"
            );

            seedEmployeeIfNotExists(
                    "DIST-SK-NORTH",
                    "Anand Verma",
                    "admin",
                    "District Admin",
                    "District Emergency Control Cell",
                    "Sikkim",
                    "North Sikkim"
            );

            seedEmployeeIfNotExists(
                    "EMP-SDRF-09",
                    "Dawa Lepcha",
                    "admin",
                    "MDoNER Employee",
                    "SDRF Tactical Field Inspectorate",
                    "Sikkim",
                    "Mangan"
            );
        } catch (Exception ex) {
            log.warn("Could not pre-seed employees: {}", ex.getMessage());
        }
    }

    private void seedEmployeeIfNotExists(String empId, String name, String password, String role,
                                         String dept, String state, String district) {
        if (employeeRepository.findByEmployeeId(empId).isEmpty()) {
            Employee emp = Employee.builder()
                    .employeeId(empId)
                    .name(name)
                    .password(password)
                    .role(role)
                    .department(dept)
                    .state(state)
                    .district(district)
                    .active(true)
                    .createdAt(LocalDateTime.now())
                    .build();
            employeeRepository.save(emp);
            log.info("Seeded default official account: {} ({})", empId, role);
        }
    }

    @Transactional
    public LoginResponseDto authenticate(LoginRequestDto dto) {
        String role = dto.getRole() != null ? dto.getRole().trim() : "Citizen";
        String identifier = dto.getIdentifier() != null ? dto.getIdentifier().trim() : "";

        // Citizen Authentication (Phone OTP / GPS Heartbeat registration)
        if ("Citizen".equalsIgnoreCase(role)) {
            if (identifier.isEmpty() || !identifier.matches("\\d{10}")) {
                return LoginResponseDto.builder()
                        .status("FAILED")
                        .message("Invalid 10-digit mobile number format.")
                        .build();
            }

            Long phone = Long.parseLong(identifier);
            Optional<Citizen> existing = citizenRepository.findById(phone);
            Citizen citizen;

            if (existing.isPresent()) {
                citizen = existing.get();
                if (dto.getLatitude() != null && dto.getLongitude() != null) {
                    citizen.setLatitude(dto.getLatitude());
                    citizen.setLongitude(dto.getLongitude());
                    citizen.setLastUpdatedAt(LocalDateTime.now());
                    citizenRepository.save(citizen);
                }
            } else {
                citizen = Citizen.builder()
                        .number(phone)
                        .latitude(dto.getLatitude() != null ? dto.getLatitude() : 27.6328)
                        .longitude(dto.getLongitude() != null ? dto.getLongitude() : 88.9482)
                        .lang("en")
                        .lastUpdatedAt(LocalDateTime.now())
                        .build();
                citizenRepository.save(citizen);
                log.info("Registered new citizen node: {}", phone);
            }

            return LoginResponseDto.builder()
                    .status("SUCCESS")
                    .message("Citizen authenticated successfully.")
                    .token(UUID.randomUUID().toString())
                    .role("Citizen")
                    .identifier(String.valueOf(citizen.getNumber()))
                    .name("Civilian Observer " + identifier.substring(identifier.length() - 4))
                    .department("Citizen Incident Reporter Network")
                    .district("North Sikkim")
                    .state("Sikkim")
                    .lang(citizen.getLang())
                    .build();
        }

        // Official / Employee Authentication
        if (identifier.isEmpty()) {
            return LoginResponseDto.builder()
                    .status("FAILED")
                    .message("Official ID is required.")
                    .build();
        }

        Optional<Employee> empOpt = employeeRepository.findByEmployeeId(identifier);

        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            String pwd = dto.getPassword() != null ? dto.getPassword() : "";
            if (!emp.getPassword().equals(pwd) && !"admin".equals(pwd)) {
                return LoginResponseDto.builder()
                        .status("FAILED")
                        .message("Invalid authorization credentials.")
                        .build();
            }

            return LoginResponseDto.builder()
                    .status("SUCCESS")
                    .message("Employee authorization confirmed.")
                    .token(UUID.randomUUID().toString())
                    .role(emp.getRole())
                    .identifier(emp.getEmployeeId())
                    .name(emp.getName())
                    .department(emp.getDepartment())
                    .district(emp.getDistrict())
                    .state(emp.getState())
                    .lang("en")
                    .build();
        }

        // Demo fallback for official IDs tested with password "admin"
        if ("admin".equals(dto.getPassword())) {
            String resolvedRole = role.isEmpty() ? "MDoNER Employee" : role;
            return LoginResponseDto.builder()
                    .status("SUCCESS")
                    .message("Authorized via fallback operational profile.")
                    .token(UUID.randomUUID().toString())
                    .role(resolvedRole)
                    .identifier(identifier)
                    .name("Officer " + identifier)
                    .department("NER Disaster Risk Operations")
                    .district("North Sikkim")
                    .state("Sikkim")
                    .lang("en")
                    .build();
        }

        return LoginResponseDto.builder()
                .status("FAILED")
                .message("Official not found or unauthorized. Use 'admin' for demo accounts.")
                .build();
    }
}
