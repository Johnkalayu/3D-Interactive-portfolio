from django.core.management.base import BaseCommand
from portfolio.models import Tool, Project

class Command(BaseCommand):
    help = 'Seeds the database with initial DevOps tools and projects'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')
        
        tools_data = [
            {'name': 'Ansible', 'category': 'IaC', 'description': 'Configuration management and automation tool for infrastructure provisioning.'},
            {'name': 'AWS', 'category': 'Cloud', 'description': 'Amazon Web Services cloud platform for scalable infrastructure and services.'},
            {'name': 'Azure', 'category': 'Cloud', 'description': 'Microsoft cloud computing platform with comprehensive DevOps integration.'},
            {'name': 'Bash', 'category': 'Scripting', 'description': 'Unix shell scripting for automation and system administration tasks.'},
            {'name': 'Datadog', 'category': 'Monitoring', 'description': 'Cloud monitoring and analytics platform for infrastructure and applications.'},
            {'name': 'Git', 'category': 'CI/CD', 'description': 'Distributed version control system for tracking code changes.'},
            {'name': 'GitLab', 'category': 'CI/CD', 'description': 'Complete DevOps platform with integrated CI/CD pipelines.'},
            {'name': 'Grafana', 'category': 'Monitoring', 'description': 'Open-source analytics and visualization platform for metrics.'},
            {'name': 'Helm', 'category': 'Container', 'description': 'Kubernetes package manager for deploying and managing applications.'},
            {'name': 'Jenkins', 'category': 'CI/CD', 'description': 'Automation server for continuous integration and deployment pipelines.'},
            {'name': 'JFrog', 'category': 'CI/CD', 'description': 'Universal artifact repository manager for DevOps workflows.'},
            {'name': 'Kubernetes', 'category': 'Container', 'description': 'Container orchestration platform for automated deployment and scaling.'},
            {'name': 'Linux', 'category': 'Scripting', 'description': 'Open-source operating system essential for server infrastructure.'},
            {'name': 'Maven', 'category': 'CI/CD', 'description': 'Build automation tool for Java projects and dependency management.'},
            {'name': 'Nginx', 'category': 'IaC', 'description': 'High-performance web server and reverse proxy for load balancing.'},
            {'name': 'Prometheus', 'category': 'Monitoring', 'description': 'Open-source monitoring and alerting toolkit for cloud-native systems.'},
            {'name': 'Python', 'category': 'Scripting', 'description': 'Versatile programming language for automation and infrastructure scripting.'},
            {'name': 'Snyk', 'category': 'Security', 'description': 'Security platform for finding and fixing vulnerabilities in code.'},
            {'name': 'SonarQube', 'category': 'Security', 'description': 'Code quality and security analysis platform for continuous inspection.'},
            {'name': 'Terraform', 'category': 'IaC', 'description': 'Infrastructure as Code tool for building and managing cloud resources.'},
            {'name': 'Trivy', 'category': 'Security', 'description': 'Container vulnerability scanner for security compliance.'},
        ]
        
        created_tools = {}
        for tool_data in tools_data:
            tool, created = Tool.objects.get_or_create(
                name=tool_data['name'],
                defaults={
                    'category': tool_data['category'],
                    'description': tool_data['description'],
                    'icon_path': f'/static/img/tools/{tool_data["name"].lower()}.png'
                }
            )
            created_tools[tool.name] = tool
            if created:
                self.stdout.write(f'Created tool: {tool.name}')
        
        projects_data = [
            {
                'title': 'Multi-Cloud Infrastructure Automation',
                'description': 'Built automated infrastructure provisioning across AWS and Azure using Terraform with reusable modules. Implemented GitOps workflow with GitLab CI/CD for deployment.',
                'link': 'https://github.com/example/multi-cloud',
                'tools': ['Terraform', 'AWS', 'Azure', 'GitLab', 'Python']
            },
            {
                'title': 'Kubernetes Monitoring Stack',
                'description': 'Deployed comprehensive monitoring solution using Prometheus and Grafana on Kubernetes. Created custom dashboards and alerting rules for production workloads.',
                'link': 'https://github.com/example/k8s-monitoring',
                'tools': ['Kubernetes', 'Prometheus', 'Grafana', 'Helm']
            },
            {
                'title': 'CI/CD Pipeline Optimization',
                'description': 'Redesigned Jenkins pipelines reducing build time by 60%. Integrated SonarQube and Snyk for automated security scanning in the deployment process.',
                'link': 'https://github.com/example/cicd-pipeline',
                'tools': ['Jenkins', 'SonarQube', 'Snyk', 'Maven', 'Git']
            },
            {
                'title': 'Container Security Hardening',
                'description': 'Implemented automated container vulnerability scanning with Trivy in CI/CD pipeline. Established security policies and remediation workflows.',
                'link': '',
                'tools': ['Trivy', 'Kubernetes', 'GitLab', 'Docker']
            },
            {
                'title': 'Infrastructure Monitoring Dashboard',
                'description': 'Built real-time infrastructure monitoring using Datadog with custom metrics and log aggregation. Integrated alerting with Slack for incident response.',
                'link': 'https://github.com/example/datadog-monitoring',
                'tools': ['Datadog', 'AWS', 'Python', 'Bash']
            },
            {
                'title': 'Ansible Configuration Management',
                'description': 'Created Ansible playbooks for automated server configuration and application deployment. Managed 100+ servers with standardized configuration.',
                'link': 'https://github.com/example/ansible-playbooks',
                'tools': ['Ansible', 'Linux', 'Python', 'Git']
            }
        ]
        
        for project_data in projects_data:
            project, created = Project.objects.get_or_create(
                title=project_data['title'],
                defaults={
                    'description': project_data['description'],
                    'link': project_data['link']
                }
            )
            
            if created:
                for tool_name in project_data['tools']:
                    if tool_name in created_tools:
                        project.tools.add(created_tools[tool_name])
                self.stdout.write(f'Created project: {project.title}')
        
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
