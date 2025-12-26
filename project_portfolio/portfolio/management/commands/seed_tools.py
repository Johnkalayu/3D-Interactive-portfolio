from django.core.management.base import BaseCommand
from portfolio.models import Tool, Project

class Command(BaseCommand):
    help = 'Seeds the database with DevOps tools and sample projects'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding DevOps tools...')
        
        # DevOps Tools
        tools_data = [
            {
                'name': 'AWS',
                'category': 'cloud',
                'description': 'Amazon Web Services - Cloud computing platform',
                'icon_path': 'image/tools/aws.png'
            },
            {
                'name': 'Docker',
                'category': 'devops',
                'description': 'Container platform for building and deploying applications',
                'icon_path': 'image/tools/docker.png'
            },
            {
                'name': 'Kubernetes',
                'category': 'devops',
                'description': 'Container orchestration platform',
                'icon_path': 'image/tools/kubernetes.png'
            },
            {
                'name': 'Terraform',
                'category': 'devops',
                'description': 'Infrastructure as Code tool',
                'icon_path': 'image/tools/terraform.png'
            },
            {
                'name': 'Jenkins',
                'category': 'devops',
                'description': 'Automation server for CI/CD pipelines',
                'icon_path': 'image/tools/jenkins.png'
            },
            {
                'name': 'GitLab',
                'category': 'devops',
                'description': 'DevOps platform with Git repository management',
                'icon_path': 'image/tools/gitlab.png'
            },
            {
                'name': 'Ansible',
                'category': 'devops',
                'description': 'Configuration management and automation tool',
                'icon_path': 'image/tools/ansible.png'
            },
            {
                'name': 'Prometheus',
                'category': 'devops',
                'description': 'Monitoring and alerting toolkit',
                'icon_path': 'image/tools/prometheus.png'
            },
            {
                'name': 'Grafana',
                'category': 'devops',
                'description': 'Analytics and monitoring platform',
                'icon_path': 'image/tools/grafana.png'
            },
            {
                'name': 'Python',
                'category': 'backend',
                'description': 'High-level programming language',
                'icon_path': 'image/tools/python.png'
            },
            {
                'name': 'Django',
                'category': 'backend',
                'description': 'Python web framework',
                'icon_path': 'image/tools/django.png'
            },
            {
                'name': 'PostgreSQL',
                'category': 'database',
                'description': 'Advanced open-source relational database',
                'icon_path': 'image/tools/postgresql.png'
            },
            {
                'name': 'Redis',
                'category': 'database',
                'description': 'In-memory data structure store',
                'icon_path': 'image/tools/redis.png'
            },
            {
                'name': 'Nginx',
                'category': 'devops',
                'description': 'High-performance web server and reverse proxy',
                'icon_path': 'image/tools/nginx.png'
            },
            {
                'name': 'React',
                'category': 'frontend',
                'description': 'JavaScript library for building user interfaces',
                'icon_path': 'image/tools/react.png'
            },
        ]
        
        created_tools = {}
        for tool_data in tools_data:
            tool, created = Tool.objects.get_or_create(
                name=tool_data['name'],
                defaults={
                    'category': tool_data['category'],
                    'description': tool_data['description'],
                    'icon_path': tool_data['icon_path']
                }
            )
            created_tools[tool_data['name']] = tool
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created tool: {tool.name}'))
            else:
                self.stdout.write(f'Tool already exists: {tool.name}')
        
        # Sample Projects
        self.stdout.write('\nSeeding sample projects...')
        
        projects_data = [
            {
                'title': 'Cloud Infrastructure Automation',
                'description': 'Automated AWS infrastructure deployment using Terraform with multi-region support, auto-scaling, and disaster recovery.',
                'link': 'https://github.com/example/cloud-infra',
                'tools': ['AWS', 'Terraform', 'Docker', 'Ansible']
            },
            {
                'title': 'Microservices Platform',
                'description': 'Kubernetes-based microservices platform with service mesh, monitoring, and automated CI/CD pipelines.',
                'link': 'https://github.com/example/microservices',
                'tools': ['Kubernetes', 'Docker', 'Jenkins', 'Prometheus', 'Grafana']
            },
            {
                'title': 'E-Commerce Application',
                'description': 'Full-stack e-commerce platform with Django backend, React frontend, and PostgreSQL database.',
                'link': 'https://github.com/example/ecommerce',
                'tools': ['Python', 'Django', 'React', 'PostgreSQL', 'Redis', 'Nginx']
            },
            {
                'title': 'DevOps Pipeline',
                'description': 'Complete CI/CD pipeline with GitLab, automated testing, security scanning, and deployment to Kubernetes.',
                'link': 'https://github.com/example/devops-pipeline',
                'tools': ['GitLab', 'Docker', 'Kubernetes', 'Terraform']
            },
            {
                'title': 'Monitoring Stack',
                'description': 'Comprehensive monitoring solution with Prometheus, Grafana, and alerting for infrastructure and applications.',
                'link': 'https://github.com/example/monitoring',
                'tools': ['Prometheus', 'Grafana', 'Docker', 'Kubernetes']
            },
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
                # Add tools to project
                for tool_name in project_data['tools']:
                    if tool_name in created_tools:
                        project.tools.add(created_tools[tool_name])
                
                self.stdout.write(self.style.SUCCESS(f'Created project: {project.title}'))
            else:
                self.stdout.write(f'Project already exists: {project.title}')
        
        self.stdout.write(self.style.SUCCESS('\nSeeding completed successfully!'))
        self.stdout.write(self.style.WARNING('\nRemember to add tool icons to: static/image/tools/'))
        self.stdout.write('Required icon files:')
        for tool_data in tools_data:
            icon_filename = tool_data['name'].lower() + '.png'
            self.stdout.write(f'  - {icon_filename}')