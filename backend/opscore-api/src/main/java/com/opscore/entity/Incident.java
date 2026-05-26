package com.opscore.entity;

import com.opscore.enums.Category;
import com.opscore.enums.IncidentStatus;
import com.opscore.enums.IncidentType;
import com.opscore.enums.Priority;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.opscore.entity.Area;
import com.opscore.entity.User;

@Entity
@Table(name = "incidents")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    /*@Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;*/

    @Column(length = 100)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Builder.Default
    private Boolean isFalseAlarm = false;

    @ManyToOne
    @JoinColumn(name = "area_id")
    private Area area;

    @ManyToOne
    @JoinColumn(name = "reported_by")
    private User reportedBy;

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @ManyToOne
    @JoinColumn(name = "supervisor_id")
    private User supervisor;

    // Auditoría
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private String updatedBy;
    private String resolvedBy;

    //IncidentLog
    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL)
    private List<IncidentLog> logs = new ArrayList<>();
}

