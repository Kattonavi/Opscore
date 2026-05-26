package com.opscore.entity;

import com.opscore.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "assignments")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con Incident
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "incident_id", nullable = false)
    private Incident incident;

    // Quién recibe
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to", nullable = false)
    private User assignedTo;

    // Quién asigna
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by", nullable = false)
    private User assignedBy;

    // Cuándo se asigna
    @Column(nullable = false)
    private LocalDateTime assignedAt;

    // Opcional pero MUY útil
    @PrePersist
    public void prePersist() {
        this.assignedAt = LocalDateTime.now();
    }

    // getters/setters
}

