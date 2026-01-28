# Architektur

Diese Dokumentation beschreibt die architektonischen Entscheidungen dieser NestJS Anwendung.

## Übersicht

Dieses Projekt folgt den Prinzipien von Domain-Driven-Design (DDD) und einem hexadiagonalen Ansatz. Es wird außerdem das CQRS-Pattern (Command Query Responsibility Segregation) um eine Trennung zwischen Schreib- und Leseoperationen zu gewährleisten.

## Kern-Konzepte

### Warum Domain-Driven-Design (DDD)?

Der Vorteil von DDD ist, dass die Fachlichkeit in Softwareprojekten durch die einzelnen Geschäftslogiken (Domänen) in den Vordergrund gestellt wird. Durch eine dadurch entstehende einheitliche Sprache (Ubiquitous Language) können zwischen Entwicklern und Fachbereichen Missverständnisse vermieden werden. Die Zerteilung in abgegrenzte Bereiche (Bounded Contexts) sorgt dafür, dass Systembereiche unabhängig voneinander entwickelt werden können.

### Warum CQRS (Command Query Responsibility Segregation)?

CQRS ermöglicht eine strikte Trennung der Verantwortlichkeiten. Die Unterteilung in Commands (Schreiboperationen) und Queries (Leseoperationen) verhindert, dass einfache Datenabfragen durch komplexe Geschäftslogik unnötig verkompliziert werden. Zudem lässt sich die Performance von Schreib- und Leseoperationen unabhängig voneinander skalieren und optimieren. Da jeder Handler einer einzelnen Aufgabe folgt (Single Responsibility Prinzip), erhöht sich die Wartbarkeit bei gleichzeitig sinkender Fehleranfälligkeit. Dies erlaubt eine saubere Kapselung von komplexen Validierungen auf der Schreibseite sowie spezialisierten Abfragemodellen auf der Leseseite.

### Warum hexagonaler Ansatz?

Der hexagonale Ansatz sorgt im Projekt dafür, dass die eigentliche Geschäftslogik von der Außenwelt isoliert bleibt. Die Domäne definiert dabei nur noch sogenannte Ports (Schnittstellen), damit sie nicht wissen muss, welche Datenbank oder API am Ende genutzt wird. Technologien wie Prisma oder NestJS sind dann nur noch Adapter, die man theoretisch austauschen könnte, ohne den Kern anfassen zu müssen. Das macht das Ganze flexibel und einfacher zu testen, da die Logik ohne die Infrastruktur geprüft werden kann. Außerdem ermöglicht es dass schnelle Austauschen von Technologien wie z.B Prisma durch Drizzle. etc.

## Tech-Stack

- NestJS v11
- Prisma v7
- PostgreSQL
- Docker Compose
