import { Test, TestingModule } from '@nestjs/testing';
import { ConcertsController } from './concerts.controller';
import { ConcertsService } from './concerts.service';
import { CreateConcertDto, UpdateConcertDto } from './dto/concert.dto';

describe('ConcertsController', () => {
  let controller: ConcertsController;
  let service: ConcertsService;

  const mockConcertsService = {
    findAll: jest.fn(),
    findPaginated: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConcertsController],
      providers: [
        {
          provide: ConcertsService,
          useValue: mockConcertsService,
        },
      ],
    }).compile();

    controller = module.get<ConcertsController>(ConcertsController);
    service = module.get<ConcertsService>(ConcertsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated concerts when page and limit are > 0', async () => {
      const result = { data: [], total: 0, page: 1, limit: 10 };
      jest.spyOn(service, 'findPaginated').mockResolvedValue(result);

      expect(await controller.findAll(1, 10, 'rock')).toBe(result);
      expect(service.findPaginated).toHaveBeenCalledWith(1, 10, 'rock');
    });

    it('should return all concerts when page or limit are not > 0', async () => {
      const result = [];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll(0, 0)).toBe(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a concert by id', async () => {
      const result = { id: 'uuid' };
      jest.spyOn(service, 'findOne').mockResolvedValue(result as any);

      expect(await controller.findOne('uuid')).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith('uuid');
    });
  });

  describe('create', () => {
    it('should create a concert', async () => {
      const dto: CreateConcertDto = {
        name: 'Test Concert',
        description: 'Test Description',
        date: new Date().toISOString(),
        totalSeats: 100,
        price: 50,
      };
      const result = { id: 'uuid', ...dto };
      jest.spyOn(service, 'create').mockResolvedValue(result as any);

      expect(await controller.create(dto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a concert', async () => {
      const dto: UpdateConcertDto = { name: 'Updated name' };
      const result = { id: 'uuid', name: 'Updated name' };
      jest.spyOn(service, 'update').mockResolvedValue(result as any);

      expect(await controller.update('uuid', dto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith('uuid', dto);
    });
  });

  describe('remove', () => {
    it('should call service remove', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove('uuid');
      expect(service.remove).toHaveBeenCalledWith('uuid');
    });
  });
});
